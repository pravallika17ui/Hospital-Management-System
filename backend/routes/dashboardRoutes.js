const express = require('express');
const router = express.Router();
const {
    getAdminStats,
    getDoctorStats,
    getPatientStats
} = require('../controllers/dashboardController');
const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');

router.use(verifyToken);

router.get('/admin', authorizeRoles('admin'), getAdminStats);
router.get('/doctor', authorizeRoles('doctor'), getDoctorStats);
router.get('/patient', authorizeRoles('patient'), getPatientStats);

module.exports = router;
