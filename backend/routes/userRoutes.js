const express = require('express');
const router = express.Router();
const { getAllUsers, toggleUserStatus } = require('../controllers/userController');
const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');

router.use(verifyToken, authorizeRoles('admin'));

router.get('/', getAllUsers);
router.put('/:id/status', toggleUserStatus);

module.exports = router;
