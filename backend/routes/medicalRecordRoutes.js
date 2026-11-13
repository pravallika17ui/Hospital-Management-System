const express = require('express');
const router = express.Router();
const {
    getAllMedicalRecords,
    getMedicalRecordById,
    createMedicalRecord,
    updateMedicalRecord,
    getAllPrescriptions
} = require('../controllers/medicalRecordController');
const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');

router.use(verifyToken);

// Prescriptions list
router.get('/prescriptions/all', getAllPrescriptions);

// Medical records CRUD
router.get('/', getAllMedicalRecords);
router.get('/:id', getMedicalRecordById);
router.post('/', authorizeRoles('doctor', 'admin'), createMedicalRecord);
router.put('/:id', authorizeRoles('doctor', 'admin'), updateMedicalRecord);

module.exports = router;
