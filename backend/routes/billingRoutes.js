const express = require('express');
const router = express.Router();
const {
    getAllBills,
    getBillById,
    createBill,
    updateBill,
    payBill
} = require('../controllers/billingController');
const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');

router.use(verifyToken);

router.get('/', getAllBills);
router.get('/:id', getBillById);
router.post('/', authorizeRoles('admin'), createBill);
router.put('/:id', authorizeRoles('admin'), updateBill);
router.post('/:id/pay', authorizeRoles('patient', 'admin'), payBill);

module.exports = router;
