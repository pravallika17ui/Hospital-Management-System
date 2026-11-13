const { query } = require('../config/db');
const { generateCode, sendSuccess, sendError } = require('../utils/helpers');

// GET /api/appointments
const getAllAppointments = async (req, res, next) => {
    try {
        const { status, date, doctor_id, patient_id } = req.query;

        let sql = `
            SELECT a.id, a.appointment_number, a.appointment_date, a.appointment_time, 
                   a.reason, a.status, a.created_at,
                   p.id AS patient_id, u_pat.name AS patient_name, u_pat.email AS patient_email, 
                   u_pat.phone AS patient_phone, p.blood_group, p.gender,
                   d.id AS doctor_id, u_doc.name AS doctor_name, d.specialization, 
                   d.consultation_fee,
                   (SELECT id FROM medical_records m WHERE m.appointment_id = a.id LIMIT 1) AS medical_record_id,
                   (SELECT id FROM bills b WHERE b.appointment_id = a.id LIMIT 1) AS bill_id
            FROM appointments a
            JOIN patients p ON a.patient_id = p.id
            JOIN users u_pat ON p.user_id = u_pat.id
            JOIN doctors d ON a.doctor_id = d.id
            JOIN users u_doc ON d.user_id = u_doc.id
            WHERE 1=1
        `;
        const params = [];

        // Role-based scoping
        if (req.user.role === 'patient') {
            sql += ` AND a.patient_id = ?`;
            params.push(req.user.patient_id);
        } else if (req.user.role === 'doctor') {
            sql += ` AND a.doctor_id = ?`;
            params.push(req.user.doctor_id);
        } else {
            // Admin query filters
            if (doctor_id) {
                sql += ` AND a.doctor_id = ?`;
                params.push(doctor_id);
            }
            if (patient_id) {
                sql += ` AND a.patient_id = ?`;
                params.push(patient_id);
            }
        }

        if (status) {
            sql += ` AND a.status = ?`;
            params.push(status);
        }

        if (date) {
            sql += ` AND a.appointment_date = ?`;
            params.push(date);
        }

        sql += ` ORDER BY a.appointment_date DESC, a.appointment_time DESC`;

        const appointments = await query(sql, params);

        return sendSuccess(res, 'Appointments retrieved successfully.', appointments);
    } catch (err) {
        next(err);
    }
};

// GET /api/appointments/:id
const getAppointmentById = async (req, res, next) => {
    try {
        const { id } = req.params;

        const appointments = await query(
            `SELECT a.*, 
                    p.id AS patient_id, u_pat.name AS patient_name, u_pat.email AS patient_email, 
                    u_pat.phone AS patient_phone, p.blood_group, p.gender, p.dob, p.address,
                    d.id AS doctor_id, u_doc.name AS doctor_name, d.specialization, 
                    d.qualification, d.consultation_fee
             FROM appointments a
             JOIN patients p ON a.patient_id = p.id
             JOIN users u_pat ON p.user_id = u_pat.id
             JOIN doctors d ON a.doctor_id = d.id
             JOIN users u_doc ON d.user_id = u_doc.id
             WHERE a.id = ?`,
            [id]
        );

        if (appointments.length === 0) {
            return sendError(res, 'Appointment not found.', null, 404);
        }

        const appointment = appointments[0];

        // Role authorization check
        if (req.user.role === 'patient' && appointment.patient_id !== req.user.patient_id) {
            return sendError(res, 'Access denied.', null, 403);
        }
        if (req.user.role === 'doctor' && appointment.doctor_id !== req.user.doctor_id) {
            return sendError(res, 'Access denied.', null, 403);
        }

        return sendSuccess(res, 'Appointment details retrieved.', appointment);
    } catch (err) {
        next(err);
    }
};

// POST /api/appointments (Book Appointment)
const bookAppointment = async (req, res, next) => {
    try {
        let { patient_id, doctor_id, appointment_date, appointment_time, reason } = req.body;

        // If patient books, enforce patient_id from auth token
        if (req.user.role === 'patient') {
            patient_id = req.user.patient_id;
        }

        if (!patient_id || !doctor_id || !appointment_date || !appointment_time || !reason) {
            return sendError(res, 'All fields (doctor, date, time slot, and reason) are required.', null, 400);
        }

        // Validate date (must not be in the past)
        const selectedDate = new Date(appointment_date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (selectedDate < today) {
            return sendError(res, 'Appointment date cannot be in the past.', null, 400);
        }

        // Standardize time string HH:MM:00
        const timeParts = appointment_time.split(':');
        const formattedTime = `${timeParts[0].padStart(2, '0')}:${timeParts[1].padStart(2, '0')}:00`;

        // Check for double-booking conflict
        const conflicts = await query(
            `SELECT id FROM appointments 
             WHERE doctor_id = ? AND appointment_date = ? AND appointment_time = ? AND status != 'Cancelled'`,
            [doctor_id, appointment_date, formattedTime]
        );

        if (conflicts.length > 0) {
            return sendError(
                res, 
                'Slot unavailable: The selected doctor already has a booked appointment at this date and time. Please select another slot.', 
                null, 
                409
            );
        }

        const appointmentNumber = generateCode('APT');
        const initialStatus = req.user.role === 'admin' ? 'Confirmed' : 'Pending';

        const result = await query(
            `INSERT INTO appointments (appointment_number, patient_id, doctor_id, appointment_date, appointment_time, reason, status)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [appointmentNumber, patient_id, doctor_id, appointment_date, formattedTime, reason.trim(), initialStatus]
        );

        return sendSuccess(res, 'Appointment successfully scheduled!', {
            id: result.insertId,
            appointment_number: appointmentNumber,
            doctor_id,
            patient_id,
            appointment_date,
            appointment_time: formattedTime,
            status: initialStatus
        }, 201);
    } catch (err) {
        next(err);
    }
};

// PUT /api/appointments/:id/status
const updateAppointmentStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const validStatuses = ['Pending', 'Confirmed', 'Completed', 'Cancelled'];
        if (!validStatuses.includes(status)) {
            return sendError(res, `Invalid status. Must be one of: ${validStatuses.join(', ')}`, null, 400);
        }

        const appointments = await query('SELECT * FROM appointments WHERE id = ?', [id]);
        if (appointments.length === 0) {
            return sendError(res, 'Appointment not found.', null, 404);
        }

        const apt = appointments[0];

        // Role authorization rules
        if (req.user.role === 'patient') {
            if (apt.patient_id !== req.user.patient_id) {
                return sendError(res, 'Access denied.', null, 403);
            }
            if (status !== 'Cancelled') {
                return sendError(res, 'Patients are only permitted to cancel an appointment.', null, 403);
            }
        } else if (req.user.role === 'doctor') {
            if (apt.doctor_id !== req.user.doctor_id) {
                return sendError(res, 'Access denied. You can only update appointments assigned to you.', null, 403);
            }
        }

        await query('UPDATE appointments SET status = ? WHERE id = ?', [status, id]);

        return sendSuccess(res, `Appointment status updated to ${status}.`, { id, status });
    } catch (err) {
        next(err);
    }
};

// DELETE /api/appointments/:id (Admin only)
const deleteAppointment = async (req, res, next) => {
    try {
        const { id } = req.params;

        const result = await query('DELETE FROM appointments WHERE id = ?', [id]);
        if (result.affectedRows === 0) {
            return sendError(res, 'Appointment not found.', null, 404);
        }

        return sendSuccess(res, 'Appointment deleted successfully.');
    } catch (err) {
        next(err);
    }
};

module.exports = {
    getAllAppointments,
    getAppointmentById,
    bookAppointment,
    updateAppointmentStatus,
    deleteAppointment
};
