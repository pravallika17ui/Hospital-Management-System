const jwt = require('jsonwebtoken');
const { query } = require('../config/db');
const { sendError } = require('../utils/helpers');

const verifyToken = async (req, res, next) => {
    try {
        let token;
        const authHeader = req.headers.authorization;

        if (authHeader && authHeader.startsWith('Bearer ')) {
            token = authHeader.split(' ')[1];
        }

        if (!token) {
            return sendError(res, 'Access denied. No authentication token provided.', null, 401);
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'hospital_management_system_super_secret_jwt_key_2026');

        // Fetch user from DB to verify validity and status
        const users = await query(
            'SELECT id, name, email, role, phone, status FROM users WHERE id = ?',
            [decoded.id]
        );

        if (!users || users.length === 0) {
            return sendError(res, 'User account no longer exists.', null, 401);
        }

        const user = users[0];

        if (user.status !== 'active') {
            return sendError(res, 'Your account has been deactivated. Please contact the administrator.', null, 403);
        }

        // Attach doctor_id or patient_id if applicable
        if (user.role === 'patient') {
            const patients = await query('SELECT id FROM patients WHERE user_id = ?', [user.id]);
            if (patients.length > 0) {
                user.patient_id = patients[0].id;
            }
        } else if (user.role === 'doctor') {
            const doctors = await query('SELECT id, specialization, consultation_fee FROM doctors WHERE user_id = ?', [user.id]);
            if (doctors.length > 0) {
                user.doctor_id = doctors[0].id;
                user.specialization = doctors[0].specialization;
                user.consultation_fee = doctors[0].consultation_fee;
            }
        }

        req.user = user;
        next();
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return sendError(res, 'Authentication token has expired. Please log in again.', null, 401);
        }
        return sendError(res, 'Invalid authentication token.', null, 401);
    }
};

const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return sendError(
                res,
                `Forbidden: Access restricted to roles [${roles.join(', ')}]. Your role is '${req.user ? req.user.role : 'unauthenticated'}'.`,
                null,
                403
            );
        }
        next();
    };
};

module.exports = {
    verifyToken,
    authorizeRoles
};
