const { query, pool } = require('../config/db');
const { generateCode, sendSuccess, sendError } = require('../utils/helpers');

// GET /api/bills
const getAllBills = async (req, res, next) => {
    try {
        const { payment_status, patient_id, search = '' } = req.query;

        let sql = `
            SELECT b.id, b.bill_number, b.consultation_fee, b.medicine_charges,
                   b.lab_charges, b.other_charges, b.total_amount, b.payment_status,
                   b.payment_method, b.bill_date, b.paid_at, b.notes, b.created_at,
                   p.id AS patient_id, p_user.name AS patient_name, p_user.email AS patient_email, p_user.phone AS patient_phone,
                   d.id AS doctor_id, d_user.name AS doctor_name, d.specialization,
                   a.appointment_number
            FROM bills b
            JOIN patients p ON b.patient_id = p.id
            JOIN users p_user ON p.user_id = p_user.id
            LEFT JOIN doctors d ON b.doctor_id = d.id
            LEFT JOIN users d_user ON d.user_id = d_user.id
            LEFT JOIN appointments a ON b.appointment_id = a.id
            WHERE 1=1
        `;
        const params = [];

        if (req.user.role === 'patient') {
            sql += ` AND b.patient_id = ?`;
            params.push(req.user.patient_id);
        } else {
            if (patient_id) {
                sql += ` AND b.patient_id = ?`;
                params.push(patient_id);
            }
        }

        if (payment_status) {
            sql += ` AND b.payment_status = ?`;
            params.push(payment_status);
        }

        if (search) {
            sql += ` AND (b.bill_number LIKE ? OR p_user.name LIKE ?)`;
            const wildcard = `%${search}%`;
            params.push(wildcard, wildcard);
        }

        sql += ` ORDER BY b.bill_date DESC, b.id DESC`;

        const bills = await query(sql, params);

        return sendSuccess(res, 'Bills retrieved successfully.', bills);
    } catch (err) {
        next(err);
    }
};

// GET /api/bills/:id
const getBillById = async (req, res, next) => {
    try {
        const { id } = req.params;

        const bills = await query(
            `SELECT b.*,
                    p.id AS patient_id, p_user.name AS patient_name, p_user.email AS patient_email, 
                    p_user.phone AS patient_phone, p.blood_group, p.address,
                    d.id AS doctor_id, d_user.name AS doctor_name, d.specialization,
                    a.appointment_number
             FROM bills b
             JOIN patients p ON b.patient_id = p.id
             JOIN users p_user ON p.user_id = p_user.id
             LEFT JOIN doctors d ON b.doctor_id = d.id
             LEFT JOIN users d_user ON d.user_id = d_user.id
             LEFT JOIN appointments a ON b.appointment_id = a.id
             WHERE b.id = ?`,
            [id]
        );

        if (bills.length === 0) {
            return sendError(res, 'Bill not found.', null, 404);
        }

        const bill = bills[0];

        if (req.user.role === 'patient' && bill.patient_id !== req.user.patient_id) {
            return sendError(res, 'Access denied.', null, 403);
        }

        // Fetch payments made against this bill
        const payments = await query('SELECT * FROM payments WHERE bill_id = ? ORDER BY payment_date DESC', [id]);
        bill.payments = payments;

        return sendSuccess(res, 'Bill details retrieved.', bill);
    } catch (err) {
        next(err);
    }
};

// POST /api/bills (Admin only)
const createBill = async (req, res, next) => {
    try {
        const {
            patient_id,
            doctor_id,
            appointment_id,
            consultation_fee = 0,
            medicine_charges = 0,
            lab_charges = 0,
            other_charges = 0,
            payment_status = 'Unpaid',
            payment_method = null,
            bill_date,
            notes
        } = req.body;

        if (!patient_id) {
            return sendError(res, 'Patient selection is required to generate a bill.', null, 400);
        }

        const billNumber = generateCode('INV');
        const effectiveBillDate = bill_date || new Date().toISOString().split('T')[0];

        const cFee = parseFloat(consultation_fee) || 0;
        const mCharges = parseFloat(medicine_charges) || 0;
        const lCharges = parseFloat(lab_charges) || 0;
        const oCharges = parseFloat(other_charges) || 0;

        const result = await query(
            `INSERT INTO bills (
                bill_number, patient_id, doctor_id, appointment_id,
                consultation_fee, medicine_charges, lab_charges, other_charges,
                payment_status, payment_method, bill_date, notes
             ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                billNumber,
                patient_id,
                doctor_id || null,
                appointment_id || null,
                cFee,
                mCharges,
                lCharges,
                oCharges,
                payment_status,
                payment_method || null,
                effectiveBillDate,
                notes || null
            ]
        );

        const total = cFee + mCharges + lCharges + oCharges;

        return sendSuccess(res, 'Invoice successfully generated.', {
            id: result.insertId,
            bill_number: billNumber,
            patient_id,
            total_amount: total,
            payment_status
        }, 201);
    } catch (err) {
        next(err);
    }
};

// PUT /api/bills/:id (Admin update)
const updateBill = async (req, res, next) => {
    try {
        const { id } = req.params;
        const {
            consultation_fee,
            medicine_charges,
            lab_charges,
            other_charges,
            payment_status,
            payment_method,
            notes
        } = req.body;

        const updates = [];
        const params = [];

        if (consultation_fee !== undefined) {
            updates.push('consultation_fee = ?');
            params.push(parseFloat(consultation_fee) || 0);
        }
        if (medicine_charges !== undefined) {
            updates.push('medicine_charges = ?');
            params.push(parseFloat(medicine_charges) || 0);
        }
        if (lab_charges !== undefined) {
            updates.push('lab_charges = ?');
            params.push(parseFloat(lab_charges) || 0);
        }
        if (other_charges !== undefined) {
            updates.push('other_charges = ?');
            params.push(parseFloat(other_charges) || 0);
        }
        if (payment_status !== undefined) {
            updates.push('payment_status = ?');
            params.push(payment_status);
            if (payment_status === 'Paid') {
                updates.push('paid_at = NOW()');
            }
        }
        if (payment_method !== undefined) {
            updates.push('payment_method = ?');
            params.push(payment_method);
        }
        if (notes !== undefined) {
            updates.push('notes = ?');
            params.push(notes);
        }

        if (updates.length > 0) {
            params.push(id);
            await query(`UPDATE bills SET ${updates.join(', ')} WHERE id = ?`, params);
        }

        return sendSuccess(res, 'Bill updated successfully.');
    } catch (err) {
        next(err);
    }
};

// POST /api/bills/:id/pay (Patient or Admin processes payment)
const payBill = async (req, res, next) => {
    let connection;
    try {
        const { id } = req.params;
        const { payment_method = 'UPI', amount } = req.body;

        const bills = await query('SELECT * FROM bills WHERE id = ?', [id]);
        if (bills.length === 0) {
            return sendError(res, 'Bill not found.', null, 404);
        }

        const bill = bills[0];

        if (bill.payment_status === 'Paid') {
            return sendError(res, 'This invoice has already been fully settled.', null, 400);
        }

        const paymentAmount = amount ? parseFloat(amount) : bill.total_amount;
        const transactionId = `TXN-${payment_method.toUpperCase()}-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-${Math.floor(1000 + Math.random()*9000)}`;

        connection = await pool.getConnection();
        await connection.beginTransaction();

        // Record payment
        await connection.execute(
            `INSERT INTO payments (bill_id, transaction_id, amount, payment_method, status)
             VALUES (?, ?, ?, ?, 'Success')`,
            [id, transactionId, paymentAmount, payment_method]
        );

        // Update bill status to Paid
        await connection.execute(
            `UPDATE bills SET payment_status = 'Paid', payment_method = ?, paid_at = NOW() WHERE id = ?`,
            [payment_method, id]
        );

        await connection.commit();

        return sendSuccess(res, 'Payment processed successfully! Thank you.', {
            bill_id: id,
            transaction_id: transactionId,
            amount: paymentAmount,
            payment_method,
            status: 'Paid'
        });
    } catch (err) {
        if (connection) await connection.rollback();
        next(err);
    } finally {
        if (connection) connection.release();
    }
};

module.exports = {
    getAllBills,
    getBillById,
    createBill,
    updateBill,
    payBill
};
