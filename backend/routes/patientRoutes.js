const express = require('express');
const router = express.Router();
const {
    getAllPatients,
    getPatientById,
    createPatient,
    updatePatient,
    deletePatient
} = require('../controllers/patientController');
const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');

// Admin and Doctor can view patients list
router.get('/', verifyToken, authorizeRoles('admin', 'doctor'), getAllPatients);

// Patient, Doctor, or Admin can view specific patient details
router.get('/:id', verifyToken, getPatientById);

// Admin can create a patient directly
router.post('/', verifyToken, authorizeRoles('admin'), createPatient);

// Patient can update own profile, Admin can update any
router.put('/:id', verifyToken, authorizeRoles('admin', 'patient'), updatePatient);

// Admin can delete patient
router.delete('/:id', verifyToken, authorizeRoles('admin'), deletePatient);

module.exports = router;
