const bcrypt = require('bcryptjs');
const { query, pool } = require('../config/db');
const { sendSuccess, sendError, isValidEmail } = require('../utils/helpers');

// GET /api/patients (Admin & Doctor)
const getAllPatients = async (req, res, next) => {
    try {
        const { search = '', blood_group, page = 1, limit = 50 } = req.query;
        const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);

        let sql = `
            SELECT p.id, p.user_id, u.name, u.email, u.phone, u.status,
                   p.dob, p.gender, p.blood_group, p.address, p.emergency_contact,
                   p.created_at,
                   (SELECT COUNT(*) FROM appointments a WHERE a.patient_id = p.id) AS total_appointments,
                   (SELECT COUNT(*) FROM medical_records m WHERE m.patient_id = p.id) AS total_records
            FROM patients p
            JOIN users u ON p.user_id = u.id
            WHERE 1=1
        `;
        const params = [];

        if (search) {
            sql += ` AND (u.name LIKE ? OR u.email LIKE ? OR u.phone LIKE ?)`;
            const searchWildcard = `%${search}%`;
            params.push(searchWildcard, searchWildcard, searchWildcard);
        }

        if (blood_group) {
            sql += ` AND p.blood_group = ?`;
            params.push(blood_group);
        }

        sql += ` ORDER BY p.id DESC LIMIT ? OFFSET ?`;
        params.push(parseInt(limit, 10), parseInt(offset, 10));

        const patients = await query(sql, params);

        // Count total
        let countSql = `SELECT COUNT(*) as total FROM patients p JOIN users u ON p.user_id = u.id WHERE 1=1`;
        const countParams = [];
        if (search) {
            countSql += ` AND (u.name LIKE ? OR u.email LIKE ? OR u.phone LIKE ?)`;
            countParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
        }
        if (blood_group) {
            countSql += ` AND p.blood_group = ?`;
            countParams.push(blood_group);
        }
        const totalResult = await query(countSql, countParams);

        return sendSuccess(res, 'Patients retrieved successfully.', {
            patients,
            pagination: {
                total: totalResult[0].total,
                page: parseInt(page, 10),
                limit: parseInt(limit, 10),
                totalPages: Math.ceil(totalResult[0].total / parseInt(limit, 10))
            }
        });
    } catch (err) {
        next(err);
    }
};

// GET /api/patients/:id
const getPatientById = async (req, res, next) => {
    try {
        const { id } = req.params;

        // Authorization check: patient can only view their own
        if (req.user.role === 'patient') {
            const myPatient = await query('SELECT id FROM patients WHERE user_id = ?', [req.user.id]);
            if (!myPatient.length || myPatient[0].id !== parseInt(id, 10)) {
                return sendError(res, 'Access denied. You can only view your own patient profile.', null, 403);
            }
        }

        const patients = await query(
            `SELECT p.id, p.user_id, u.name, u.email, u.phone, u.status,
                    p.dob, p.gender, p.blood_group, p.address, p.emergency_contact, p.created_at
             FROM patients p
             JOIN users u ON p.user_id = u.id
             WHERE p.id = ?`,
            [id]
        );

        if (patients.length === 0) {
            return sendError(res, 'Patient not found.', null, 404);
        }

        const patient = patients[0];

        // Fetch recent appointments
        const appointments = await query(
            `SELECT a.*, d_user.name AS doctor_name, d.specialization
             FROM appointments a
             JOIN doctors d ON a.doctor_id = d.id
             JOIN users d_user ON d.user_id = d_user.id
             WHERE a.patient_id = ?
             ORDER BY a.appointment_date DESC, a.appointment_time DESC
             LIMIT 10`,
            [id]
        );

        // Fetch medical records
        const medicalRecords = await query(
            `SELECT m.*, d_user.name AS doctor_name, d.specialization
             FROM medical_records m
             JOIN doctors d ON m.doctor_id = d.id
             JOIN users d_user ON d.user_id = d_user.id
             WHERE m.patient_id = ?
             ORDER BY m.visit_date DESC
             LIMIT 10`,
            [id]
        );

        // Fetch bills
        const bills = await query(
            `SELECT b.*, d_user.name AS doctor_name
             FROM bills b
             LEFT JOIN doctors d ON b.doctor_id = d.id
             LEFT JOIN users d_user ON d.user_id = d_user.id
             WHERE b.patient_id = ?
             ORDER BY b.bill_date DESC
             LIMIT 10`,
            [id]
        );

        return sendSuccess(res, 'Patient details retrieved.', {
            patient,
            appointments,
            medicalRecords,
            bills
        });
    } catch (err) {
        next(err);
    }
};

// POST /api/patients (Admin creation)
const createPatient = async (req, res, next) => {
    let connection;
    try {
        const { name, email, password = 'Password@123', phone, dob, gender, blood_group, address, emergency_contact } = req.body;

        if (!name || !email || !gender) {
            return sendError(res, 'Name, email, and gender are required.', null, 400);
        }

        if (!isValidEmail(email)) {
            return sendError(res, 'Invalid email address.', null, 400);
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
            `INSERT INTO users (name, email, password, role, phone, status) VALUES (?, ?, ?, 'patient', ?, 'active')`,
            [name.trim(), email.toLowerCase().trim(), hashedPassword, phone || null]
        );

        const [patientResult] = await connection.execute(
            `INSERT INTO patients (user_id, dob, gender, blood_group, address, emergency_contact) VALUES (?, ?, ?, ?, ?, ?)`,
            [userResult.insertId, dob || null, gender, blood_group || null, address || null, emergency_contact || null]
        );

        await connection.commit();

        return sendSuccess(res, 'Patient created successfully.', {
            patient_id: patientResult.insertId,
            user_id: userResult.insertId,
            name,
            email
        }, 201);
    } catch (err) {
        if (connection) await connection.rollback();
        next(err);
    } finally {
        if (connection) connection.release();
    }
};

// PUT /api/patients/:id (Admin or Patient self)
const updatePatient = async (req, res, next) => {
    let connection;
    try {
        const { id } = req.params;
        const { name, phone, dob, gender, blood_group, address, emergency_contact, status } = req.body;

        const patientCheck = await query('SELECT user_id FROM patients WHERE id = ?', [id]);
        if (patientCheck.length === 0) {
            return sendError(res, 'Patient not found.', null, 404);
        }

        const userId = patientCheck[0].user_id;

        // Authorization: Admin can update any; patient can only update their own
        if (req.user.role === 'patient' && req.user.id !== userId) {
            return sendError(res, 'Access denied. You can only update your own profile.', null, 403);
        }

        connection = await pool.getConnection();
        await connection.beginTransaction();

        // Update user table
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

        // Update patients table
        const patientUpdates = [];
        const patientParams = [];

        if (dob !== undefined) {
            patientUpdates.push('dob = ?');
            patientParams.push(dob || null);
        }
        if (gender !== undefined) {
            patientUpdates.push('gender = ?');
            patientParams.push(gender);
        }
        if (blood_group !== undefined) {
            patientUpdates.push('blood_group = ?');
            patientParams.push(blood_group || null);
        }
        if (address !== undefined) {
            patientUpdates.push('address = ?');
            patientParams.push(address || null);
        }
        if (emergency_contact !== undefined) {
            patientUpdates.push('emergency_contact = ?');
            patientParams.push(emergency_contact || null);
        }

        if (patientUpdates.length > 0) {
            patientParams.push(id);
            await connection.execute(`UPDATE patients SET ${patientUpdates.join(', ')} WHERE id = ?`, patientParams);
        }

        await connection.commit();

        return sendSuccess(res, 'Patient profile updated successfully.');
    } catch (err) {
        if (connection) await connection.rollback();
        next(err);
    } finally {
        if (connection) connection.release();
    }
};

// DELETE /api/patients/:id (Admin only)
const deletePatient = async (req, res, next) => {
    try {
        const { id } = req.params;

        const patient = await query('SELECT user_id FROM patients WHERE id = ?', [id]);
        if (patient.length === 0) {
            return sendError(res, 'Patient not found.', null, 404);
        }

        // Deleting user cascades to patient, appointments, medical records, etc.
        await query('DELETE FROM users WHERE id = ?', [patient[0].user_id]);

        return sendSuccess(res, 'Patient record and associated data removed successfully.');
    } catch (err) {
        next(err);
    }
};

module.exports = {
    getAllPatients,
    getPatientById,
    createPatient,
    updatePatient,
    deletePatient
};
