const { query } = require('../config/db');
const { sendSuccess, sendError } = require('../utils/helpers');

// GET /api/users (Admin only)
const getAllUsers = async (req, res, next) => {
    try {
        const { role, status, search = '' } = req.query;

        let sql = `SELECT id, name, email, role, phone, status, created_at FROM users WHERE 1=1`;
        const params = [];

        if (role) {
            sql += ` AND role = ?`;
            params.push(role);
        }

        if (status) {
            sql += ` AND status = ?`;
            params.push(status);
        }

        if (search) {
            sql += ` AND (name LIKE ? OR email LIKE ? OR phone LIKE ?)`;
            const wildcard = `%${search}%`;
            params.push(wildcard, wildcard, wildcard);
        }

        sql += ` ORDER BY id DESC`;

        const users = await query(sql, params);
        return sendSuccess(res, 'Users retrieved successfully.', users);
    } catch (err) {
        next(err);
    }
};

// PUT /api/users/:id/status (Admin toggle active/inactive)
const toggleUserStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!['active', 'inactive'].includes(status)) {
            return sendError(res, "Status must be either 'active' or 'inactive'.", null, 400);
        }

        if (parseInt(id, 10) === req.user.id) {
            return sendError(res, 'You cannot deactivate your own admin account.', null, 400);
        }

        const result = await query('UPDATE users SET status = ? WHERE id = ?', [status, id]);
        if (result.affectedRows === 0) {
            return sendError(res, 'User not found.', null, 404);
        }

        return sendSuccess(res, `User account marked as ${status}.`);
    } catch (err) {
        next(err);
    }
};

module.exports = {
    getAllUsers,
    toggleUserStatus
};
