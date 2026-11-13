const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query, pool } = require('../config/db');
const { sendSuccess, sendError, isValidEmail } = require('../utils/helpers');

// Helper to sign JWT token
const signToken = (payload) => {
    return jwt.sign(
        payload,
        process.env.JWT_SECRET || 'hospital_management_system_super_secret_jwt_key_2026',
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
};

// POST /api/auth/register (Patient self-registration)
const register = async (req, res, next) => {
    let connection;
    try {
        const {
            name,
            email,
            password,
            phone,
            dob,
            gender,
            blood_group,
            address,
            emergency_contact
        } = req.body;

        // Validation
        if (!name || !email || !password || !gender) {
            return sendError(res, 'Please provide name, email, password, and gender.', null, 400);
        }

        if (!isValidEmail(email)) {
            return sendError(res, 'Please provide a valid email address.', null, 400);
        }

        if (password.length < 6) {
            return sendError(res, 'Password must be at least 6 characters long.', null, 400);
        }

        // Check if email exists
        const existingUsers = await query('SELECT id FROM users WHERE email = ?', [email]);
        if (existingUsers.length > 0) {
            return sendError(res, 'An account with this email already exists.', null, 409);
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Transaction for user + patient
        connection = await pool.getConnection();
        await connection.beginTransaction();

        const [userResult] = await connection.execute(
            `INSERT INTO users (name, email, password, role, phone, status) 
             VALUES (?, ?, ?, 'patient', ?, 'active')`,
            [name.trim(), email.toLowerCase().trim(), hashedPassword, phone || null]
        );

        const userId = userResult.insertId;

        const [patientResult] = await connection.execute(
            `INSERT INTO patients (user_id, dob, gender, blood_group, address, emergency_contact) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [userId, dob || null, gender, blood_group || null, address || null, emergency_contact || null]
        );

        await connection.commit();

        const patientId = patientResult.insertId;
        const token = signToken({ id: userId, role: 'patient' });

        const userData = {
            id: userId,
            patient_id: patientId,
            name: name.trim(),
            email: email.toLowerCase().trim(),
            role: 'patient',
            phone,
            dob,
            gender,
            blood_group,
            address,
            emergency_contact
        };

        return sendSuccess(res, 'Registration successful! Welcome to the Hospital Portal.', { user: userData, token }, 201);
    } catch (err) {
        if (connection) await connection.rollback();
        next(err);
    } finally {
        if (connection) connection.release();
    }
};

// POST /api/auth/login
const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return sendError(res, 'Please provide both email and password.', null, 400);
        }

        const users = await query(
            `SELECT u.id, u.name, u.email, u.password, u.role, u.phone, u.status,
                    p.id AS patient_id, p.dob, p.gender, p.blood_group, p.address, p.emergency_contact,
                    d.id AS doctor_id, d.specialization, d.qualification, d.experience_years, d.consultation_fee
             FROM users u
             LEFT JOIN patients p ON u.id = p.user_id
             LEFT JOIN doctors d ON u.id = d.user_id
             WHERE u.email = ?`,
            [email.toLowerCase().trim()]
        );

        if (users.length === 0) {
            return sendError(res, 'Invalid credentials. No user found with this email.', null, 401);
        }

        const user = users[0];

        // Check active status
        if (user.status !== 'active') {
            return sendError(res, 'Account is deactivated. Please contact the administrator.', null, 403);
        }

        // Compare password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return sendError(res, 'Invalid credentials. Incorrect password.', null, 401);
        }

        // Build token and response object (exclude password)
        const token = signToken({ id: user.id, role: user.role });

        delete user.password;

        return sendSuccess(res, `Welcome back, ${user.name}!`, { user, token });
    } catch (err) {
        next(err);
    }
};

// GET /api/auth/me
const getMe = async (req, res, next) => {
    try {
        const users = await query(
            `SELECT u.id, u.name, u.email, u.role, u.phone, u.status, u.created_at,
                    p.id AS patient_id, p.dob, p.gender, p.blood_group, p.address, p.emergency_contact,
                    d.id AS doctor_id, d.specialization, d.qualification, d.experience_years, d.consultation_fee,
                    d.available_days, d.available_time_start, d.available_time_end, d.bio
             FROM users u
             LEFT JOIN patients p ON u.id = p.user_id
             LEFT JOIN doctors d ON u.id = d.user_id
             WHERE u.id = ?`,
            [req.user.id]
        );

        if (users.length === 0) {
            return sendError(res, 'User not found.', null, 404);
        }

        return sendSuccess(res, 'User profile retrieved.', users[0]);
    } catch (err) {
        next(err);
    }
};

// PUT /api/auth/update-password
const updatePassword = async (req, res, next) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return sendError(res, 'Please provide current and new password.', null, 400);
        }

        if (newPassword.length < 6) {
            return sendError(res, 'New password must be at least 6 characters long.', null, 400);
        }

        const users = await query('SELECT password FROM users WHERE id = ?', [req.user.id]);
        if (users.length === 0) {
            return sendError(res, 'User not found.', null, 404);
        }

        const isMatch = await bcrypt.compare(currentPassword, users[0].password);
        if (!isMatch) {
            return sendError(res, 'Current password does not match.', null, 400);
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        await query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, req.user.id]);

        return sendSuccess(res, 'Password successfully updated.');
    } catch (err) {
        next(err);
    }
};

module.exports = {
    register,
    login,
    getMe,
    updatePassword
};
