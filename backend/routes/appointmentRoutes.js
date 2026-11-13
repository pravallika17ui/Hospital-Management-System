const express = require('express');
const router = express.Router();
const {
    getAllAppointments,
    getAppointmentById,
    bookAppointment,
    updateAppointmentStatus,
    deleteAppointment
} = require('../controllers/appointmentController');
const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');

// All appointment operations require authentication
router.use(verifyToken);

router.get('/', getAllAppointments);
router.get('/:id', getAppointmentById);
router.post('/', authorizeRoles('patient', 'admin'), bookAppointment);
router.put('/:id/status', updateAppointmentStatus);
router.delete('/:id', authorizeRoles('admin'), deleteAppointment);

module.exports = router;
