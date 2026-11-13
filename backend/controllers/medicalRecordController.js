const { query, pool } = require('../config/db');
const { generateCode, sendSuccess, sendError } = require('../utils/helpers');

// GET /api/medical-records
const getAllMedicalRecords = async (req, res, next) => {
    try {
        const { patient_id, doctor_id, search = '' } = req.query;

        let sql = `
            SELECT m.id, m.record_number, m.appointment_id, m.patient_id, m.doctor_id,
                   m.visit_date, m.symptoms, m.diagnosis, m.treatment, m.notes, m.created_at,
                   p_user.name AS patient_name, p_user.email AS patient_email, p_user.phone AS patient_phone,
                   p.blood_group, p.gender, p.dob,
                   d_user.name AS doctor_name, d.specialization,
                   (SELECT COUNT(*) FROM prescriptions pr WHERE pr.medical_record_id = m.id) AS prescription_count
            FROM medical_records m
            JOIN patients p ON m.patient_id = p.id
            JOIN users p_user ON p.user_id = p_user.id
            JOIN doctors d ON m.doctor_id = d.id
            JOIN users d_user ON d.user_id = d_user.id
            WHERE 1=1
        `;
        const params = [];

        // Role-based filtering
        if (req.user.role === 'patient') {
            sql += ` AND m.patient_id = ?`;
            params.push(req.user.patient_id);
        } else if (req.user.role === 'doctor') {
            // Doctors can view records they authored or look up a specific patient
            if (patient_id) {
                sql += ` AND m.patient_id = ?`;
                params.push(patient_id);
            } else {
                sql += ` AND m.doctor_id = ?`;
                params.push(req.user.doctor_id);
            }
        } else {
            // Admin can filter by patient or doctor
            if (patient_id) {
                sql += ` AND m.patient_id = ?`;
                params.push(patient_id);
            }
            if (doctor_id) {
                sql += ` AND m.doctor_id = ?`;
                params.push(doctor_id);
            }
        }

        if (search) {
            sql += ` AND (m.record_number LIKE ? OR m.diagnosis LIKE ? OR p_user.name LIKE ?)`;
            const wildcard = `%${search}%`;
            params.push(wildcard, wildcard, wildcard);
        }

        sql += ` ORDER BY m.visit_date DESC, m.id DESC`;

        const records = await query(sql, params);

        return sendSuccess(res, 'Medical records retrieved.', records);
    } catch (err) {
        next(err);
    }
};

// GET /api/medical-records/:id
const getMedicalRecordById = async (req, res, next) => {
    try {
        const { id } = req.params;

        const records = await query(
            `SELECT m.*, 
                    p_user.name AS patient_name, p_user.email AS patient_email, p_user.phone AS patient_phone,
                    p.blood_group, p.gender, p.dob, p.address,
                    d_user.name AS doctor_name, d.specialization, d.qualification,
                    a.appointment_number
             FROM medical_records m
             JOIN patients p ON m.patient_id = p.id
             JOIN users p_user ON p.user_id = p_user.id
             JOIN doctors d ON m.doctor_id = d.id
             JOIN users d_user ON d.user_id = d_user.id
             LEFT JOIN appointments a ON m.appointment_id = a.id
             WHERE m.id = ?`,
            [id]
        );

        if (records.length === 0) {
            return sendError(res, 'Medical record not found.', null, 404);
        }

        const record = records[0];

        // Access check
        if (req.user.role === 'patient' && record.patient_id !== req.user.patient_id) {
            return sendError(res, 'Access denied.', null, 403);
        }

        // Fetch attached prescriptions
        const prescriptions = await query(
            `SELECT * FROM prescriptions WHERE medical_record_id = ? ORDER BY id ASC`,
            [id]
        );

        record.prescriptions = prescriptions;

        return sendSuccess(res, 'Medical record details retrieved.', record);
    } catch (err) {
        next(err);
    }
};

// POST /api/medical-records (Doctor or Admin)
const createMedicalRecord = async (req, res, next) => {
    let connection;
    try {
        let {
            appointment_id,
            patient_id,
            doctor_id,
            visit_date,
            symptoms,
            diagnosis,
            treatment,
            notes,
            prescriptions = []
        } = req.body;

        // If doctor creates, enforce doctor_id
        if (req.user.role === 'doctor') {
            doctor_id = req.user.doctor_id;
        }

        if (!patient_id || !doctor_id || !diagnosis || !treatment) {
            return sendError(res, 'Patient, doctor, diagnosis, and treatment details are required.', null, 400);
        }

        const recordNumber = generateCode('MED');
        const effectiveVisitDate = visit_date || new Date().toISOString().split('T')[0];

        connection = await pool.getConnection();
        await connection.beginTransaction();

        const [recordResult] = await connection.execute(
            `INSERT INTO medical_records (
                record_number, appointment_id, patient_id, doctor_id,
                visit_date, symptoms, diagnosis, treatment, notes
             ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                recordNumber,
                appointment_id || null,
                patient_id,
                doctor_id,
                effectiveVisitDate,
                symptoms || '',
                diagnosis.trim(),
                treatment.trim(),
                notes || null
            ]
        );

        const recordId = recordResult.insertId;

        // Insert prescriptions if provided
        if (Array.isArray(prescriptions) && prescriptions.length > 0) {
            for (const item of prescriptions) {
                if (item.medicine_name) {
                    await connection.execute(
                        `INSERT INTO prescriptions (medical_record_id, medicine_name, dosage, frequency, duration, instructions)
                         VALUES (?, ?, ?, ?, ?, ?)`,
                        [
                            recordId,
                            item.medicine_name.trim(),
                            item.dosage || 'Standard',
                            item.frequency || 'Once daily',
                            item.duration || '5 days',
                            item.instructions || null
                        ]
                    );
                }
            }
        }

        // If linked to an appointment, mark that appointment as Completed
        if (appointment_id) {
            await connection.execute(
                `UPDATE appointments SET status = 'Completed' WHERE id = ?`,
                [appointment_id]
            );
        }

        await connection.commit();

        return sendSuccess(res, 'Clinical medical record and prescription successfully documented.', {
            id: recordId,
            record_number: recordNumber,
            patient_id,
            doctor_id,
            prescriptions_count: prescriptions.length
        }, 201);
    } catch (err) {
        if (connection) await connection.rollback();
        next(err);
    } finally {
        if (connection) connection.release();
    }
};

// PUT /api/medical-records/:id
const updateMedicalRecord = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { symptoms, diagnosis, treatment, notes } = req.body;

        const recordCheck = await query('SELECT * FROM medical_records WHERE id = ?', [id]);
        if (recordCheck.length === 0) {
            return sendError(res, 'Medical record not found.', null, 404);
        }

        if (req.user.role === 'doctor' && recordCheck[0].doctor_id !== req.user.doctor_id) {
            return sendError(res, 'Access denied. You can only edit records you created.', null, 403);
        }

        const updates = [];
        const params = [];

        if (symptoms !== undefined) {
            updates.push('symptoms = ?');
            params.push(symptoms);
        }
        if (diagnosis !== undefined) {
            updates.push('diagnosis = ?');
            params.push(diagnosis.trim());
        }
        if (treatment !== undefined) {
            updates.push('treatment = ?');
            params.push(treatment.trim());
        }
        if (notes !== undefined) {
            updates.push('notes = ?');
            params.push(notes);
        }

        if (updates.length > 0) {
            params.push(id);
            await query(`UPDATE medical_records SET ${updates.join(', ')} WHERE id = ?`, params);
        }

        return sendSuccess(res, 'Medical record updated successfully.');
    } catch (err) {
        next(err);
    }
};

// GET /api/medical-records/prescriptions/all (Direct prescription list for patients)
const getAllPrescriptions = async (req, res, next) => {
    try {
        let sql = `
            SELECT pr.id, pr.medicine_name, pr.dosage, pr.frequency, pr.duration, pr.instructions, pr.created_at,
                   m.id AS medical_record_id, m.record_number, m.visit_date, m.diagnosis,
                   p.id AS patient_id, p_user.name AS patient_name,
                   d.id AS doctor_id, d_user.name AS doctor_name, d.specialization
            FROM prescriptions pr
            JOIN medical_records m ON pr.medical_record_id = m.id
            JOIN patients p ON m.patient_id = p.id
            JOIN users p_user ON p.user_id = p_user.id
            JOIN doctors d ON m.doctor_id = d.id
            JOIN users d_user ON d.user_id = d_user.id
            WHERE 1=1
        `;
        const params = [];

        if (req.user.role === 'patient') {
            sql += ` AND m.patient_id = ?`;
            params.push(req.user.patient_id);
        } else if (req.user.role === 'doctor') {
            sql += ` AND m.doctor_id = ?`;
            params.push(req.user.doctor_id);
        }

        sql += ` ORDER BY m.visit_date DESC, pr.id DESC`;

        const prescriptions = await query(sql, params);
        return sendSuccess(res, 'Prescriptions retrieved.', prescriptions);
    } catch (err) {
        next(err);
    }
};

module.exports = {
    getAllMedicalRecords,
    getMedicalRecordById,
    createMedicalRecord,
    updateMedicalRecord,
    getAllPrescriptions
};
