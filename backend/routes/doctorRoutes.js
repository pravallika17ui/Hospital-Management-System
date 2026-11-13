const express = require('express');
const router = express.Router();
const {
    getAllDoctors,
    getSpecializations,
    getDoctorById,
    getAvailableSlots,
    createDoctor,
    updateDoctor,
    deleteDoctor
} = require('../controllers/doctorController');
const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');

// Public routes for directory lookup
router.get('/', getAllDoctors);
router.get('/specializations', getSpecializations);
router.get('/:id', getDoctorById);
router.get('/:id/available-slots', getAvailableSlots);

// Admin / Doctor management routes
router.post('/', verifyToken, authorizeRoles('admin'), createDoctor);
router.put('/:id', verifyToken, authorizeRoles('admin', 'doctor'), updateDoctor);
router.delete('/:id', verifyToken, authorizeRoles('admin'), deleteDoctor);

module.exports = router;
