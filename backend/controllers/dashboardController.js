const { query } = require('../config/db');
const { sendSuccess } = require('../utils/helpers');

// GET /api/dashboard/admin
const getAdminStats = async (req, res, next) => {
    try {
        // 1. KPI Counts
        const [patientCount] = await query('SELECT COUNT(*) AS count FROM patients');
        const [doctorCount] = await query('SELECT COUNT(*) AS count FROM doctors');
        const [totalApt] = await query('SELECT COUNT(*) AS count FROM appointments');
        const [todayApt] = await query('SELECT COUNT(*) AS count FROM appointments WHERE appointment_date = CURDATE()');
        const [pendingApt] = await query("SELECT COUNT(*) AS count FROM appointments WHERE status = 'Pending'");
        const [completedApt] = await query("SELECT COUNT(*) AS count FROM appointments WHERE status = 'Completed'");

        // Total Revenue from Paid Bills
        const [revenueResult] = await query("SELECT COALESCE(SUM(total_amount), 0) AS revenue FROM bills WHERE payment_status = 'Paid'");
        const [unpaidResult] = await query("SELECT COALESCE(SUM(total_amount), 0) AS pending FROM bills WHERE payment_status = 'Unpaid'");

        // 2. Monthly Appointments Trend (Last 6 months)
        const monthlyAppointments = await query(`
            SELECT 
                DATE_FORMAT(appointment_date, '%b %Y') AS month,
                DATE_FORMAT(appointment_date, '%Y-%m') AS sort_key,
                COUNT(*) AS count
            FROM appointments
            WHERE appointment_date >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
            GROUP BY sort_key, month
            ORDER BY sort_key ASC
        `);

        // 3. Monthly Revenue Trend (Last 6 months)
        const monthlyRevenue = await query(`
            SELECT 
                DATE_FORMAT(bill_date, '%b %Y') AS month,
                DATE_FORMAT(bill_date, '%Y-%m') AS sort_key,
                COALESCE(SUM(total_amount), 0) AS revenue
            FROM bills
            WHERE payment_status = 'Paid' AND bill_date >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
            GROUP BY sort_key, month
            ORDER BY sort_key ASC
        `);

        // 4. Specialization Breakdown
        const specializationStats = await query(`
            SELECT d.specialization, COUNT(a.id) AS appointment_count
            FROM doctors d
            LEFT JOIN appointments a ON d.id = a.doctor_id
            GROUP BY d.specialization
            ORDER BY appointment_count DESC
        `);

        // 5. Recent 5 Appointments
        const recentAppointments = await query(`
            SELECT a.id, a.appointment_number, a.appointment_date, a.appointment_time, a.status,
                   u_pat.name AS patient_name, u_doc.name AS doctor_name, d.specialization
            FROM appointments a
            JOIN patients p ON a.patient_id = p.id
            JOIN users u_pat ON p.user_id = u_pat.id
            JOIN doctors d ON a.doctor_id = d.id
            JOIN users u_doc ON d.user_id = u_doc.id
            ORDER BY a.created_at DESC
            LIMIT 5
        `);

        // 6. Recent 5 Invoices
        const recentBills = await query(`
            SELECT b.id, b.bill_number, b.total_amount, b.payment_status, b.bill_date,
                   u_pat.name AS patient_name
            FROM bills b
            JOIN patients p ON b.patient_id = p.id
            JOIN users u_pat ON p.user_id = u_pat.id
            ORDER BY b.created_at DESC
            LIMIT 5
        `);

        return sendSuccess(res, 'Admin dashboard statistics retrieved.', {
            kpis: {
                totalPatients: patientCount.count,
                totalDoctors: doctorCount.count,
                totalAppointments: totalApt.count,
                todayAppointments: todayApt.count,
                pendingAppointments: pendingApt.count,
                completedAppointments: completedApt.count,
                totalRevenue: parseFloat(revenueResult.revenue),
                pendingRevenue: parseFloat(unpaidResult.pending)
            },
            monthlyAppointments,
            monthlyRevenue,
            specializationStats,
            recentAppointments,
            recentBills
        });
    } catch (err) {
        next(err);
    }
};

// GET /api/dashboard/doctor
const getDoctorStats = async (req, res, next) => {
    try {
        const doctorId = req.user.doctor_id;

        const [totalApt] = await query('SELECT COUNT(*) AS count FROM appointments WHERE doctor_id = ?', [doctorId]);
        const [todayApt] = await query('SELECT COUNT(*) AS count FROM appointments WHERE doctor_id = ? AND appointment_date = CURDATE()', [doctorId]);
        const [pendingApt] = await query("SELECT COUNT(*) AS count FROM appointments WHERE doctor_id = ? AND status = 'Pending'", [doctorId]);
        const [completedApt] = await query("SELECT COUNT(*) AS count FROM appointments WHERE doctor_id = ? AND status = 'Completed'", [doctorId]);
        const [treatedPatients] = await query('SELECT COUNT(DISTINCT patient_id) AS count FROM appointments WHERE doctor_id = ? AND status = "Completed"', [doctorId]);

        // Today's schedule
        const todaySchedule = await query(`
            SELECT a.id, a.appointment_number, a.appointment_time, a.reason, a.status,
                   p.id AS patient_id, u.name AS patient_name, u.phone AS patient_phone, p.gender, p.blood_group
            FROM appointments a
            JOIN patients p ON a.patient_id = p.id
            JOIN users u ON p.user_id = u.id
            WHERE a.doctor_id = ? AND a.appointment_date = CURDATE()
            ORDER BY a.appointment_time ASC
        `, [doctorId]);

        return sendSuccess(res, 'Doctor dashboard statistics retrieved.', {
            kpis: {
                totalAppointments: totalApt.count,
                todayAppointments: todayApt.count,
                pendingAppointments: pendingApt.count,
                completedConsultations: completedApt.count,
                treatedPatients: treatedPatients.count
            },
            todaySchedule
        });
    } catch (err) {
        next(err);
    }
};

// GET /api/dashboard/patient
const getPatientStats = async (req, res, next) => {
    try {
        const patientId = req.user.patient_id;

        const [upcomingApt] = await query(
            "SELECT COUNT(*) AS count FROM appointments WHERE patient_id = ? AND appointment_date >= CURDATE() AND status IN ('Pending', 'Confirmed')",
            [patientId]
        );
        const [pastApt] = await query(
            "SELECT COUNT(*) AS count FROM appointments WHERE patient_id = ? AND status = 'Completed'",
            [patientId]
        );
        const [recordsCount] = await query(
            'SELECT COUNT(*) AS count FROM medical_records WHERE patient_id = ?',
            [patientId]
        );
        const [unpaidBills] = await query(
            "SELECT COUNT(*) AS count, COALESCE(SUM(total_amount), 0) AS total FROM bills WHERE patient_id = ? AND payment_status = 'Unpaid'",
            [patientId]
        );

        // Next upcoming appointment
        const nextAppointments = await query(`
            SELECT a.id, a.appointment_number, a.appointment_date, a.appointment_time, a.status, a.reason,
                   u_doc.name AS doctor_name, d.specialization
            FROM appointments a
            JOIN doctors d ON a.doctor_id = d.id
            JOIN users u_doc ON d.user_id = u_doc.id
            WHERE a.patient_id = ? AND a.appointment_date >= CURDATE() AND a.status IN ('Pending', 'Confirmed')
            ORDER BY a.appointment_date ASC, a.appointment_time ASC
            LIMIT 1
        `, [patientId]);

        return sendSuccess(res, 'Patient dashboard summary retrieved.', {
            kpis: {
                upcomingAppointments: upcomingApt.count,
                completedAppointments: pastApt.count,
                totalRecords: recordsCount.count,
                unpaidBillsCount: unpaidBills.count,
                unpaidBillsTotal: parseFloat(unpaidBills.total)
            },
            nextAppointment: nextAppointments.length > 0 ? nextAppointments[0] : null
        });
    } catch (err) {
        next(err);
    }
};

module.exports = {
    getAdminStats,
    getDoctorStats,
    getPatientStats
};
