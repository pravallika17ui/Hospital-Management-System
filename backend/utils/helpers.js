/**
 * Utility helpers for Hospital Management System
 */

// Generate unique identifier with prefix and timestamp
const generateCode = (prefix = 'APT') => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const random = Math.floor(1000 + Math.random() * 9000);
    return `${prefix}-${year}${month}${day}-${random}`;
};

// Standard response wrappers
const sendSuccess = (res, message, data = null, statusCode = 200) => {
    return res.status(statusCode).json({
        success: true,
        message,
        data
    });
};

const sendError = (res, message, errors = null, statusCode = 400) => {
    return res.status(statusCode).json({
        success: false,
        message,
        errors
    });
};

// Input validation helpers
const isValidEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
};

const isValidPhone = (phone) => {
    if (!phone) return true; // optional in some cases
    const re = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/;
    return phone.length >= 8 && phone.length <= 20;
};

module.exports = {
    generateCode,
    sendSuccess,
    sendError,
    isValidEmail,
    isValidPhone
};
