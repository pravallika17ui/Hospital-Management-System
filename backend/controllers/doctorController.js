const bcrypt = require('bcryptjs');
const { query, pool } = require('../config/db');
const { sendSuccess, sendError, isValidEmail } = require('../utils/helpers');

// GET /api/doctors (Public/Authenticated)
const getAllDoctors = async (req, res, next) => {
    try {
        const { specialization, search = '' } = req.query;

        let sql = `
            SELECT d.id, d.user_id, u.name, u.email, u.phone, u.status,
                   d.specialization, d.qualification, d.experience_years,
                   d.consultation_fee, d.available_days, d.available_time_start,
                   d.available_time_end, d.slot_duration_minutes, d.bio,
                   (SELECT COUNT(*) FROM appointments a WHERE a.doctor_id = d.id AND a.status = 'Completed') AS patients_treated
            FROM doctors d
            JOIN users u ON d.user_id = u.id
            WHERE u.status = 'active'
        `;
        const params = [];

        if (specialization) {
            sql += ` AND d.specialization = ?`;
            params.push(specialization);
        }

        if (search) {
            sql += ` AND (u.name LIKE ? OR d.specialization LIKE ? OR d.qualification LIKE ?)`;
            const wildcard = `%${search}%`;
            params.push(wildcard, wildcard, wildcard);
        }

        sql += ` ORDER BY d.experience_years DESC, u.name ASC`;

        const doctors = await query(sql, params);

        return sendSuccess(res, 'Doctors retrieved successfully.', doctors);
    } catch (err) {
        next(err);
    }
};

// GET /api/doctors/specializations
const getSpecializations = async (req, res, next) => {
    try {
        const specs = await query(
            `SELECT DISTINCT specialization FROM doctors ORDER BY specialization ASC`
        );
        const list = specs.map(s => s.specialization);
        return sendSuccess(res, 'Specializations retrieved.', list);
    } catch (err) {
        next(err);
    }
};

// GET /api/doctors/:id
const getDoctorById = async (req, res, next) => {
    try {
        const { id } = req.params;

        const doctors = await query(
            `SELECT d.id, d.user_id, u.name, u.email, u.phone, u.status,
                    d.specialization, d.qualification, d.experience_years,
                    d.consultation_fee, d.available_days, d.available_time_start,
                    d.available_time_end, d.slot_duration_minutes, d.bio
             FROM doctors d
             JOIN users u ON d.user_id = u.id
             WHERE d.id = ?`,
            [id]
        );

        if (doctors.length === 0) {
            return sendError(res, 'Doctor not found.', null, 404);
        }

        return sendSuccess(res, 'Doctor details retrieved.', doctors[0]);
    } catch (err) {
        next(err);
    }
};

// GET /api/doctors/:id/available-slots?date=YYYY-MM-DD
const getAvailableSlots = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { date } = req.query;

        if (!date) {
            return sendError(res, 'Query parameter "date" (YYYY-MM-DD) is required.', null, 400);
        }

        const doctors = await query(
            `SELECT available_days, available_time_start, available_time_end, slot_duration_minutes 
             FROM doctors WHERE id = ?`,
            [id]
        );

        if (doctors.length === 0) {
            return sendError(res, 'Doctor not found.', null, 404);
        }

        const doctor = doctors[0];

        // Check if doctor works on this day of week
        const requestedDate = new Date(date);
        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const dayOfWeek = dayNames[requestedDate.getDay()];

        const availableDaysList = doctor.available_days.split(',').map(d => d.trim().toLowerCase());
        const isDayAvailable = availableDaysList.includes(dayOfWeek.toLowerCase());

        if (!isDayAvailable) {
            return sendSuccess(res, `Doctor is not scheduled to consult on ${dayOfWeek}s.`, {
                available: false,
                reason: `Doctor is unavailable on ${dayOfWeek}. Scheduled days: ${doctor.available_days}`,
                slots: []
            });
        }

        // Fetch already booked appointments on this date for this doctor that are not cancelled
        const bookedAppointments = await query(
            `SELECT appointment_time FROM appointments 
             WHERE doctor_id = ? AND appointment_date = ? AND status != 'Cancelled'`,
            [id, date]
        );

        const bookedTimes = bookedAppointments.map(a => {
            // Standardize format HH:MM:00
            const [h, m] = a.appointment_time.split(':');
            return `${h.padStart(2, '0')}:${m.padStart(2, '0')}:00`;
        });

        // Generate time slots
        const slots = [];
        const [startHour, startMinute] = doctor.available_time_start.split(':').map(Number);
        const [endHour, endMinute] = doctor.available_time_end.split(':').map(Number);
        const duration = doctor.slot_duration_minutes || 30;

        let current = new Date();
        current.setHours(startHour, startMinute, 0, 0);

        const end = new Date();
        end.setHours(endHour, endMinute, 0, 0);

        while (current < end) {
            const timeStr = `${String(current.getHours()).padStart(2, '0')}:${String(current.getMinutes()).padStart(2, '0')}:00`;
            const displayTime = current.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

            const isBooked = bookedTimes.includes(timeStr);

            slots.push({
                time: timeStr,
                displayTime,
                isAvailable: !isBooked
            });

            current.setMinutes(current.getMinutes() + duration);
        }

        return sendSuccess(res, 'Slots generated successfully.', {
            available: true,
            date,
            day: dayOfWeek,
            slots
        });
    } catch (err) {
        next(err);
    }
};

// POST /api/doctors (Admin only)
const createDoctor = async (req, res, next) => {
    let connection;
    try {
        const {
            name,
            email,
            password = 'Password@123',
            phone,
            specialization,
            qualification,
            experience_years = 0,
            consultation_fee = 500,
            available_days = 'Monday,Tuesday,Wednesday,Thursday,Friday',
            available_time_start = '09:00:00',
            available_time_end = '17:00:00',
            slot_duration_minutes = 30,
            bio = ''
        } = req.body;

        if (!name || !email || !specialization || !qualification) {
            return sendError(res, 'Name, email, specialization, and qualification are required.', null, 400);
        }

        if (!isValidEmail(email)) {
            return sendError(res, 'Invalid email address format.', null, 400);
        }

        const existing = await query('SELECT id FROM users WHERE email = ?', [email]);
        if (existing.length > 0) {
            return sendError(res, 'An account with this email already exists.', null, 409);
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        connection = await pool.getConnection();
        await connection.beginTransaction();

        const [userResult] = await connection.execute(
            `INSERT INTO users (name, email, password, role, phone, status) VALUES (?, ?, ?, 'doctor', ?, 'active')`,
            [name.trim(), email.toLowerCase().trim(), hashedPassword, phone || null]
        );

        const [doctorResult] = await connection.execute(
            `INSERT INTO doctors (
                user_id, specialization, qualification, experience_years, consultation_fee,
                available_days, available_time_start, available_time_end, slot_duration_minutes, bio
             ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                userResult.insertId,
                specialization.trim(),
                qualification.trim(),
                parseInt(experience_years, 10),
                parseFloat(consultation_fee),
                available_days,
                available_time_start,
                available_time_end,
                parseInt(slot_duration_minutes, 10),
                bio
            ]
        );

        await connection.commit();

        return sendSuccess(res, 'Doctor account created successfully.', {
            doctor_id: doctorResult.insertId,
            user_id: userResult.insertId,
            name,
            email,
            specialization
        }, 201);
    } catch (err) {
        if (connection) await connection.rollback();
        next(err);
    } finally {
        if (connection) connection.release();
    }
};

// PUT /api/doctors/:id (Admin or Doctor self)
const updateDoctor = async (req, res, next) => {
    let connection;
    try {
        const { id } = req.params;
        const {
            name,
            phone,
            specialization,
            qualification,
            experience_years,
            consultation_fee,
            available_days,
            available_time_start,
            available_time_end,
            slot_duration_minutes,
            bio,
            status
        } = req.body;

        const doctorCheck = await query('SELECT user_id FROM doctors WHERE id = ?', [id]);
        if (doctorCheck.length === 0) {
            return sendError(res, 'Doctor not found.', null, 404);
        }

        const userId = doctorCheck[0].user_id;

        if (req.user.role === 'doctor' && req.user.id !== userId) {
            return sendError(res, 'Access denied. You can only modify your own profile.', null, 403);
        }

        connection = await pool.getConnection();
        await connection.beginTransaction();

        // Update user fields
        if (name || phone || (status && req.user.role === 'admin')) {
            const userUpdates = [];
            const userParams = [];

            if (name) {
                userUpdates.push('name = ?');
                userParams.push(name.trim());
            }
            if (phone !== undefined) {
                userUpdates.push('phone = ?');
                userParams.push(phone);
            }
            if (status && req.user.role === 'admin') {
                userUpdates.push('status = ?');
                userParams.push(status);
            }

            if (userUpdates.length > 0) {
                userParams.push(userId);
                await connection.execute(`UPDATE users SET ${userUpdates.join(', ')} WHERE id = ?`, userParams);
            }
        }

        // Update doctor fields
        const docUpdates = [];
        const docParams = [];

        if (specialization !== undefined) {
            docUpdates.push('specialization = ?');
            docParams.push(specialization.trim());
        }
        if (qualification !== undefined) {
            docUpdates.push('qualification = ?');
            docParams.push(qualification.trim());
        }
        if (experience_years !== undefined) {
            docUpdates.push('experience_years = ?');
            docParams.push(parseInt(experience_years, 10));
        }
        if (consultation_fee !== undefined) {
            docUpdates.push('consultation_fee = ?');
            docParams.push(parseFloat(consultation_fee));
        }
        if (available_days !== undefined) {
            docUpdates.push('available_days = ?');
            docParams.push(available_days);
        }
        if (available_time_start !== undefined) {
            docUpdates.push('available_time_start = ?');
            docParams.push(available_time_start);
        }
        if (available_time_end !== undefined) {
            docUpdates.push('available_time_end = ?');
            docParams.push(available_time_end);
        }
        if (slot_duration_minutes !== undefined) {
            docUpdates.push('slot_duration_minutes = ?');
            docParams.push(parseInt(slot_duration_minutes, 10));
        }
        if (bio !== undefined) {
            docUpdates.push('bio = ?');
            docParams.push(bio);
        }

        if (docUpdates.length > 0) {
            docParams.push(id);
            await connection.execute(`UPDATE doctors SET ${docUpdates.join(', ')} WHERE id = ?`, docParams);
        }

        await connection.commit();

        return sendSuccess(res, 'Doctor profile updated successfully.');
    } catch (err) {
        if (connection) await connection.rollback();
        next(err);
    } finally {
        if (connection) connection.release();
    }
};

// DELETE /api/doctors/:id (Admin only)
const deleteDoctor = async (req, res, next) => {
    try {
        const { id } = req.params;

        const doctor = await query('SELECT user_id FROM doctors WHERE id = ?', [id]);
        if (doctor.length === 0) {
            return sendError(res, 'Doctor not found.', null, 404);
        }

        await query('DELETE FROM users WHERE id = ?', [doctor[0].user_id]);

        return sendSuccess(res, 'Doctor account and profile successfully removed.');
    } catch (err) {
        next(err);
    }
};

module.exports = {
    getAllDoctors,
    getSpecializations,
    getDoctorById,
    getAvailableSlots,
    createDoctor,
    updateDoctor,
    deleteDoctor
};
