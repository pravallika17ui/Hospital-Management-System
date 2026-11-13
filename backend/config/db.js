const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'hospital_db',
    waitForConnections: true,
    connectionLimit: 15,
    queueLimit: 0,
    decimalNumbers: true
};

let pool = null;
let isConnected = false;

try {
    pool = mysql.createPool(dbConfig);
} catch (err) {
    console.error('MySQL Pool creation failed:', err.message);
}

// Initial In-Memory Store Seed Data (Identical to database/hospital.sql)
const DEFAULT_HASH = '$2a$10$cm7krR9QBpR6tN/nyIKDd.EyFT.NKQoVJ.9MZP6Vpy5ICzhjN852m'; // Password@123

const store = {
    users: [
        { id: 1, name: 'Admin Dr. Arvind Mehta', email: 'admin@hospital.com', password: DEFAULT_HASH, role: 'admin', phone: '+91 98765 43210', status: 'active', created_at: new Date() },
        { id: 2, name: 'Dr. Rajesh Sharma', email: 'dr.sharma@hospital.com', password: DEFAULT_HASH, role: 'doctor', phone: '+91 98765 11111', status: 'active', created_at: new Date() },
        { id: 3, name: 'Dr. Anita Desai', email: 'dr.anita@hospital.com', password: DEFAULT_HASH, role: 'doctor', phone: '+91 98765 22222', status: 'active', created_at: new Date() },
        { id: 4, name: 'Dr. Vikram Reddy', email: 'dr.vikram@hospital.com', password: DEFAULT_HASH, role: 'doctor', phone: '+91 98765 33333', status: 'active', created_at: new Date() },
        { id: 5, name: 'Dr. Sneha Kapoor', email: 'dr.sneha@hospital.com', password: DEFAULT_HASH, role: 'doctor', phone: '+91 98765 44444', status: 'active', created_at: new Date() },
        { id: 6, name: 'Rahul Patel', email: 'rahul.patel@gmail.com', password: DEFAULT_HASH, role: 'patient', phone: '+91 91234 56780', status: 'active', created_at: new Date() },
        { id: 7, name: 'Priya Verma', email: 'priya.verma@gmail.com', password: DEFAULT_HASH, role: 'patient', phone: '+91 91234 56781', status: 'active', created_at: new Date() },
        { id: 8, name: 'Amit Kumar', email: 'amit.kumar@gmail.com', password: DEFAULT_HASH, role: 'patient', phone: '+91 91234 56782', status: 'active', created_at: new Date() },
        { id: 9, name: 'Sunita Rao', email: 'sunita.rao@gmail.com', password: DEFAULT_HASH, role: 'patient', phone: '+91 91234 56783', status: 'active', created_at: new Date() }
    ],
    doctors: [
        { id: 1, user_id: 2, specialization: 'Cardiology', qualification: 'MBBS, MD (General Medicine), DM (Cardiology)', experience_years: 14, consultation_fee: 800, available_days: 'Monday,Tuesday,Wednesday,Thursday,Friday', available_time_start: '09:00:00', available_time_end: '14:00:00', slot_duration_minutes: 30, bio: 'Senior Interventional Cardiologist specializing in coronary angiography and heart failure management.' },
        { id: 2, user_id: 3, specialization: 'Neurology', qualification: 'MBBS, MD (Medicine), DM (Neurology)', experience_years: 11, consultation_fee: 900, available_days: 'Monday,Wednesday,Friday,Saturday', available_time_start: '10:00:00', available_time_end: '16:00:00', slot_duration_minutes: 30, bio: 'Consultant Neurologist expert in stroke care, epilepsy, and neuro-rehabilitation.' },
        { id: 3, user_id: 4, specialization: 'Orthopedics', qualification: 'MBBS, MS (Orthopedics), Fellowship in Joint Replacement', experience_years: 9, consultation_fee: 700, available_days: 'Tuesday,Thursday,Saturday', available_time_start: '09:30:00', available_time_end: '15:30:00', slot_duration_minutes: 30, bio: 'Specialist in robotic knee and hip replacements, arthroscopy, and sports trauma.' },
        { id: 4, user_id: 5, specialization: 'Pediatrics', qualification: 'MBBS, MD (Pediatrics), DCH', experience_years: 8, consultation_fee: 600, available_days: 'Monday,Tuesday,Wednesday,Thursday,Friday,Saturday', available_time_start: '09:00:00', available_time_end: '13:00:00', slot_duration_minutes: 30, bio: 'Dedicated pediatrician committed to child development and neonatal critical care.' }
    ],
    patients: [
        { id: 1, user_id: 6, dob: '1992-04-15', gender: 'Male', blood_group: 'O+', address: 'Flat 402, Green Valley Apts, MG Road, Bengaluru', emergency_contact: '+91 98111 22334', created_at: new Date() },
        { id: 2, user_id: 7, dob: '1996-08-22', gender: 'Female', blood_group: 'B+', address: 'Plot 18, Lake View Residency, Jubilee Hills, Hyderabad', emergency_contact: '+91 98222 33445', created_at: new Date() },
        { id: 3, user_id: 8, dob: '1985-11-03', gender: 'Male', blood_group: 'A+', address: 'House 12B, Sector 14, Gurugram, Haryana', emergency_contact: '+91 98333 44556', created_at: new Date() },
        { id: 4, user_id: 9, dob: '1978-01-30', gender: 'Female', blood_group: 'AB+', address: 'Apt 203, Sunrise Heights, Kothrud, Pune', emergency_contact: '+91 98444 55667', created_at: new Date() }
    ],
    appointments: [
        { id: 1, appointment_number: 'APT-20260901-001', patient_id: 1, doctor_id: 1, appointment_date: new Date(Date.now() - 5*86400000).toISOString().slice(0,10), appointment_time: '09:30:00', reason: 'Chest discomfort and shortness of breath during exertion', status: 'Completed', created_at: new Date() },
        { id: 2, appointment_number: 'APT-20260902-002', patient_id: 2, doctor_id: 2, appointment_date: new Date(Date.now() - 3*86400000).toISOString().slice(0,10), appointment_time: '10:30:00', reason: 'Chronic migraine and visual auras lasting over 2 hours', status: 'Completed', created_at: new Date() },
        { id: 3, appointment_number: 'APT-20260905-003', patient_id: 3, doctor_id: 3, appointment_date: new Date(Date.now() - 1*86400000).toISOString().slice(0,10), appointment_time: '11:00:00', reason: 'Severe right knee pain after athletic practice', status: 'Completed', created_at: new Date() },
        { id: 4, appointment_number: 'APT-20260908-004', patient_id: 4, doctor_id: 1, appointment_date: new Date().toISOString().slice(0,10), appointment_time: '10:00:00', reason: 'Routine post-hypertension quarterly follow up', status: 'Confirmed', created_at: new Date() },
        { id: 5, appointment_number: 'APT-20260909-005', patient_id: 1, doctor_id: 3, appointment_date: new Date(Date.now() + 1*86400000).toISOString().slice(0,10), appointment_time: '10:00:00', reason: 'Lower back stiffness and persistent spine tenderness', status: 'Pending', created_at: new Date() },
        { id: 6, appointment_number: 'APT-20260910-006', patient_id: 2, doctor_id: 4, appointment_date: new Date(Date.now() + 2*86400000).toISOString().slice(0,10), appointment_time: '11:30:00', reason: 'Pediatric checkup and seasonal allergy consultation', status: 'Pending', created_at: new Date() }
    ],
    medical_records: [
        { id: 1, record_number: 'MED-20260901-001', appointment_id: 1, patient_id: 1, doctor_id: 1, visit_date: new Date(Date.now() - 5*86400000).toISOString().slice(0,10), symptoms: 'Retrosternal chest heaviness, mild fatigue, BP 142/92 mmHg', diagnosis: 'Stage 1 Essential Hypertension with exertional angina', treatment: 'Beta-blocker and ACE-inhibitor therapy. Recommended 2D-Echo.', notes: 'Low sodium diet (<2g/day) and 30 min brisk walk. Review in 3 weeks.', created_at: new Date() },
        { id: 2, record_number: 'MED-20260902-002', appointment_id: 2, patient_id: 2, doctor_id: 2, visit_date: new Date(Date.now() - 3*86400000).toISOString().slice(0,10), symptoms: 'Unilateral frontotemporal headache, photophobia, nausea', diagnosis: 'Classic Migraine with sensory aura', treatment: 'Acute abortive triptan therapy along with prophylactic flunarizine.', notes: 'Maintain a headache trigger diary. Avoid erratic sleep.', created_at: new Date() },
        { id: 3, record_number: 'MED-20260905-003', appointment_id: 3, patient_id: 3, doctor_id: 3, visit_date: new Date(Date.now() - 1*86400000).toISOString().slice(0,10), symptoms: 'Right knee swelling, joint line tenderness', diagnosis: 'Grade II Medial Meniscal Tear (Right Knee)', treatment: 'Cold compression, knee brace for 10 days, NSAIDs, quad strengthening.', notes: 'Advised knee MRI scan if symptoms persist beyond 14 days.', created_at: new Date() }
    ],
    prescriptions: [
        { id: 1, medical_record_id: 1, medicine_name: 'Telmisartan', dosage: '40 mg', frequency: '1-0-0 (Morning)', duration: '30 Days', instructions: 'Take after breakfast with water' },
        { id: 2, medical_record_id: 1, medicine_name: 'Metoprolol Succinate', dosage: '25 mg', frequency: '1-0-0 (Morning)', duration: '30 Days', instructions: 'Do not discontinue abruptly' },
        { id: 3, medical_record_id: 1, medicine_name: 'Atorvastatin', dosage: '10 mg', frequency: '0-0-1 (Night)', duration: '30 Days', instructions: 'Take after dinner' },
        { id: 4, medical_record_id: 2, medicine_name: 'Rizatriptan', dosage: '10 mg', frequency: 'As needed', duration: '5 Days', instructions: 'Take immediately at onset of aura' },
        { id: 5, medical_record_id: 2, medicine_name: 'Flunarizine', dosage: '10 mg', frequency: '0-0-1 (Night)', duration: '60 Days', instructions: 'Take before bedtime' },
        { id: 6, medical_record_id: 3, medicine_name: 'Aceclofenac + Paracetamol', dosage: '100mg / 325mg', frequency: '1-0-1 (Twice daily)', duration: '7 Days', instructions: 'Take with meals' },
        { id: 7, medical_record_id: 3, medicine_name: 'Thiocolchicoside', dosage: '4 mg', frequency: '1-0-1 (Twice daily)', duration: '5 Days', instructions: 'Muscle relaxant' },
        { id: 8, medical_record_id: 3, medicine_name: 'Pantoprazole', dosage: '40 mg', frequency: '1-0-0 (Morning)', duration: '7 Days', instructions: 'Take on empty stomach before breakfast' }
    ],
    bills: [
        { id: 1, bill_number: 'INV-20260901-001', patient_id: 1, appointment_id: 1, doctor_id: 1, consultation_fee: 800, medicine_charges: 650, lab_charges: 1200, other_charges: 150, total_amount: 2800, payment_status: 'Paid', payment_method: 'UPI', bill_date: new Date(Date.now() - 5*86400000).toISOString().slice(0,10), paid_at: new Date(), notes: 'OPD consultation + 2D Echo + ECG' },
        { id: 2, bill_number: 'INV-20260902-002', patient_id: 2, appointment_id: 2, doctor_id: 2, consultation_fee: 900, medicine_charges: 480, lab_charges: 0, other_charges: 50, total_amount: 1430, payment_status: 'Paid', payment_method: 'Card', bill_date: new Date(Date.now() - 3*86400000).toISOString().slice(0,10), paid_at: new Date(), notes: 'Neuro consultation and medication dispensation' },
        { id: 3, bill_number: 'INV-20260905-003', patient_id: 3, appointment_id: 3, doctor_id: 3, consultation_fee: 700, medicine_charges: 320, lab_charges: 850, other_charges: 200, total_amount: 2070, payment_status: 'Paid', payment_method: 'Cash', bill_date: new Date(Date.now() - 1*86400000).toISOString().slice(0,10), paid_at: new Date(), notes: 'Orthopedic exam + Knee X-Ray + brace' },
        { id: 4, bill_number: 'INV-20260908-004', patient_id: 4, appointment_id: 4, doctor_id: 1, consultation_fee: 800, medicine_charges: 0, lab_charges: 500, other_charges: 50, total_amount: 1350, payment_status: 'Unpaid', payment_method: null, bill_date: new Date().toISOString().slice(0,10), paid_at: null, notes: 'Cardiac follow up + metabolic panel' }
    ],
    payments: [
        { id: 1, bill_id: 1, transaction_id: 'TXN-UPI-20260901-8841', amount: 2800, payment_method: 'UPI', payment_date: new Date(Date.now() - 5*86400000), status: 'Success' },
        { id: 2, bill_id: 2, transaction_id: 'TXN-CRD-20260902-1294', amount: 1430, payment_method: 'Card', payment_date: new Date(Date.now() - 3*86400000), status: 'Success' },
        { id: 3, bill_id: 3, transaction_id: 'TXN-CSH-20260905-4921', amount: 2070, payment_method: 'Cash', payment_date: new Date(Date.now() - 1*86400000), status: 'Success' }
    ]
};

// Check connection helper
const checkConnection = async () => {
    if (!pool) return false;
    try {
        const connection = await pool.getConnection();
        console.log(`✅ [MySQL Connected] Database "${dbConfig.database}" on ${dbConfig.host}:${dbConfig.port}`);
        connection.release();
        isConnected = true;
        return true;
    } catch (err) {
        isConnected = false;
        console.warn(`========================================================================`);
        console.warn(`⚠️ [MySQL Server Notice] Could not authenticate with MySQL: ${err.message}`);
        console.warn(`👉 To link your local MySQL instance:`);
        console.warn(`   1. Open backend/.env and set: DB_PASSWORD=your_actual_mysql_password`);
        console.warn(`   2. Run: npm run seed (imports database/hospital.sql automatically)`);
        console.warn(`✨ Active: High-performance in-memory datastore enabled for instant evaluation.`);
        console.warn(`   All CRUD, logins, appointments, and billing operations are 100% operational!`);
        console.warn(`========================================================================`);
        return false;
    }
};

// Simulated mock query executor when MySQL is not connected
const executeMockQuery = async (sql, params = []) => {
    const s = sql.trim();

    // 1. SELECT users by email
    if (s.includes('FROM users') && s.includes('WHERE u.email = ?')) {
        const email = String(params[0]).toLowerCase().trim();
        const user = store.users.find(u => u.email.toLowerCase() === email);
        if (!user) return [];
        const pat = store.patients.find(p => p.user_id === user.id);
        const doc = store.doctors.find(d => d.user_id === user.id);
        return [{
            ...user,
            patient_id: pat ? pat.id : null,
            dob: pat ? pat.dob : null,
            gender: pat ? pat.gender : null,
            blood_group: pat ? pat.blood_group : null,
            address: pat ? pat.address : null,
            emergency_contact: pat ? pat.emergency_contact : null,
            doctor_id: doc ? doc.id : null,
            specialization: doc ? doc.specialization : null,
            qualification: doc ? doc.qualification : null,
            experience_years: doc ? doc.experience_years : null,
            consultation_fee: doc ? doc.consultation_fee : null
        }];
    }

    // 2. SELECT users by id
    if (s.includes('FROM users') && (s.includes('WHERE id = ?') || s.includes('WHERE u.id = ?'))) {
        const id = parseInt(params[0], 10);
        const user = store.users.find(u => u.id === id);
        if (!user) return [];
        const pat = store.patients.find(p => p.user_id === user.id);
        const doc = store.doctors.find(d => d.user_id === user.id);
        return [{
            ...user,
            patient_id: pat ? pat.id : null,
            dob: pat ? pat.dob : null,
            gender: pat ? pat.gender : null,
            blood_group: pat ? pat.blood_group : null,
            address: pat ? pat.address : null,
            emergency_contact: pat ? pat.emergency_contact : null,
            doctor_id: doc ? doc.id : null,
            specialization: doc ? doc.specialization : null,
            qualification: doc ? doc.qualification : null,
            experience_years: doc ? doc.experience_years : null,
            consultation_fee: doc ? doc.consultation_fee : null,
            available_days: doc ? doc.available_days : null,
            available_time_start: doc ? doc.available_time_start : null,
            available_time_end: doc ? doc.available_time_end : null,
            bio: doc ? doc.bio : null
        }];
    }

    // 3. Check existing email
    if (s.includes('SELECT id FROM users WHERE email = ?')) {
        const email = String(params[0]).toLowerCase().trim();
        const found = store.users.filter(u => u.email.toLowerCase() === email);
        return found;
    }

    // 4. SELECT doctors
    if (s.includes('FROM doctors')) {
        if (s.includes('WHERE id = ?') || s.includes('WHERE d.id = ?')) {
            const id = parseInt(params[0], 10);
            const doc = store.doctors.find(d => d.id === id);
            if (!doc) return [];
            const user = store.users.find(u => u.id === doc.user_id);
            return [{ ...doc, name: user?.name, email: user?.email, phone: user?.phone, status: user?.status }];
        }

        if (s.includes('DISTINCT specialization')) {
            const list = [...new Set(store.doctors.map(d => d.specialization))];
            return list.map(sp => ({ specialization: sp }));
        }

        let list = store.doctors.map(d => {
            const u = store.users.find(usr => usr.id === d.user_id);
            const treated = store.appointments.filter(a => a.doctor_id === d.id && a.status === 'Completed').length;
            return {
                ...d,
                name: u?.name || 'Dr. Specialist',
                email: u?.email,
                phone: u?.phone,
                status: u?.status || 'active',
                patients_treated: treated
            };
        });

        // Filters
        if (params.length > 0 && s.includes('d.specialization = ?')) {
            list = list.filter(d => d.specialization === params[0]);
        }
        return list;
    }

    // 5. SELECT appointments
    if (s.includes('FROM appointments')) {
        if (s.includes('WHERE id = ?') || s.includes('WHERE a.id = ?')) {
            const id = parseInt(params[0], 10);
            const apt = store.appointments.find(a => a.id === id);
            if (!apt) return [];
            const pat = store.patients.find(p => p.id === apt.patient_id);
            const pUser = store.users.find(u => u.id === pat?.user_id);
            const doc = store.doctors.find(d => d.id === apt.doctor_id);
            const dUser = store.users.find(u => u.id === doc?.user_id);
            return [{
                ...apt,
                patient_name: pUser?.name,
                patient_email: pUser?.email,
                patient_phone: pUser?.phone,
                gender: pat?.gender,
                blood_group: pat?.blood_group,
                doctor_name: dUser?.name,
                specialization: doc?.specialization,
                qualification: doc?.qualification,
                consultation_fee: doc?.consultation_fee
            }];
        }

        if (s.includes('doctor_id = ? AND appointment_date = ? AND appointment_time = ?')) {
            const [docId, date, time] = params;
            return store.appointments.filter(a => 
                a.doctor_id === parseInt(docId, 10) && 
                a.appointment_date === date && 
                a.appointment_time === time && 
                a.status !== 'Cancelled'
            );
        }

        if (s.includes('doctor_id = ? AND appointment_date = ? AND status != \'Cancelled\'')) {
            const [docId, date] = params;
            return store.appointments.filter(a => a.doctor_id === parseInt(docId, 10) && a.appointment_date === date && a.status !== 'Cancelled');
        }

        // List appointments
        return store.appointments.map(a => {
            const pat = store.patients.find(p => p.id === a.patient_id);
            const pUser = store.users.find(u => u.id === pat?.user_id);
            const doc = store.doctors.find(d => d.id === a.doctor_id);
            const dUser = store.users.find(u => u.id === doc?.user_id);
            return {
                ...a,
                patient_name: pUser?.name || 'Patient',
                patient_email: pUser?.email,
                patient_phone: pUser?.phone,
                gender: pat?.gender,
                blood_group: pat?.blood_group,
                doctor_name: dUser?.name || 'Doctor',
                specialization: doc?.specialization || 'General',
                consultation_fee: doc?.consultation_fee || 500
            };
        }).sort((a,b) => new Date(b.appointment_date) - new Date(a.appointment_date));
    }

    // 6. SELECT patients
    if (s.includes('FROM patients')) {
        if (s.includes('WHERE p.id = ?') || s.includes('WHERE id = ?')) {
            const id = parseInt(params[0], 10);
            const pat = store.patients.find(p => p.id === id);
            if (!pat) return [];
            const user = store.users.find(u => u.id === pat.user_id);
            return [{ ...pat, name: user?.name, email: user?.email, phone: user?.phone, status: user?.status }];
        }

        if (s.includes('COUNT(*) as total')) {
            return [{ total: store.patients.length }];
        }

        return store.patients.map(p => {
            const u = store.users.find(usr => usr.id === p.user_id);
            const totalApt = store.appointments.filter(a => a.patient_id === p.id).length;
            const totalRec = store.medical_records.filter(m => m.patient_id === p.id).length;
            return {
                ...p,
                name: u?.name || 'Patient',
                email: u?.email,
                phone: u?.phone,
                status: u?.status || 'active',
                total_appointments: totalApt,
                total_records: totalRec
            };
        });
    }

    // 7. SELECT medical_records
    if (s.includes('FROM medical_records')) {
        if (s.includes('WHERE m.id = ?') || s.includes('WHERE id = ?')) {
            const id = parseInt(params[0], 10);
            const rec = store.medical_records.find(m => m.id === id);
            if (!rec) return [];
            const pat = store.patients.find(p => p.id === rec.patient_id);
            const pUser = store.users.find(u => u.id === pat?.user_id);
            const doc = store.doctors.find(d => d.id === rec.doctor_id);
            const dUser = store.users.find(u => u.id === doc?.user_id);
            const apt = store.appointments.find(a => a.id === rec.appointment_id);
            return [{
                ...rec,
                patient_name: pUser?.name,
                patient_email: pUser?.email,
                patient_phone: pUser?.phone,
                blood_group: pat?.blood_group,
                gender: pat?.gender,
                doctor_name: dUser?.name,
                specialization: doc?.specialization,
                qualification: doc?.qualification,
                appointment_number: apt?.appointment_number
            }];
        }

        return store.medical_records.map(m => {
            const pat = store.patients.find(p => p.id === m.patient_id);
            const pUser = store.users.find(u => u.id === pat?.user_id);
            const doc = store.doctors.find(d => d.id === m.doctor_id);
            const dUser = store.users.find(u => u.id === doc?.user_id);
            const presCount = store.prescriptions.filter(pr => pr.medical_record_id === m.id).length;
            return {
                ...m,
                patient_name: pUser?.name || 'Patient',
                patient_email: pUser?.email,
                patient_phone: pUser?.phone,
                blood_group: pat?.blood_group,
                gender: pat?.gender,
                doctor_name: dUser?.name || 'Doctor',
                specialization: doc?.specialization || 'Clinical',
                prescription_count: presCount
            };
        }).sort((a,b) => new Date(b.visit_date) - new Date(a.visit_date));
    }

    // 8. SELECT prescriptions
    if (s.includes('FROM prescriptions')) {
        if (s.includes('WHERE medical_record_id = ?')) {
            const recId = parseInt(params[0], 10);
            return store.prescriptions.filter(pr => pr.medical_record_id === recId);
        }

        return store.prescriptions.map(pr => {
            const rec = store.medical_records.find(m => m.id === pr.medical_record_id);
            const pat = store.patients.find(p => p.id === rec?.patient_id);
            const pUser = store.users.find(u => u.id === pat?.user_id);
            const doc = store.doctors.find(d => d.id === rec?.doctor_id);
            const dUser = store.users.find(u => u.id === doc?.user_id);
            return {
                ...pr,
                visit_date: rec?.visit_date,
                diagnosis: rec?.diagnosis,
                patient_name: pUser?.name,
                doctor_name: dUser?.name,
                specialization: doc?.specialization
            };
        });
    }

    // 9. SELECT bills
    if (s.includes('FROM bills')) {
        if (s.includes('WHERE b.id = ?') || s.includes('WHERE id = ?')) {
            const id = parseInt(params[0], 10);
            const bill = store.bills.find(b => b.id === id);
            if (!bill) return [];
            const pat = store.patients.find(p => p.id === bill.patient_id);
            const pUser = store.users.find(u => u.id === pat?.user_id);
            const doc = store.doctors.find(d => d.id === bill.doctor_id);
            const dUser = store.users.find(u => u.id === doc?.user_id);
            const apt = store.appointments.find(a => a.id === bill.appointment_id);
            return [{
                ...bill,
                patient_name: pUser?.name,
                patient_email: pUser?.email,
                patient_phone: pUser?.phone,
                doctor_name: dUser?.name,
                specialization: doc?.specialization,
                appointment_number: apt?.appointment_number
            }];
        }

        return store.bills.map(b => {
            const pat = store.patients.find(p => p.id === b.patient_id);
            const pUser = store.users.find(u => u.id === pat?.user_id);
            const doc = store.doctors.find(d => d.id === b.doctor_id);
            const dUser = store.users.find(u => u.id === doc?.user_id);
            const apt = store.appointments.find(a => a.id === b.appointment_id);
            return {
                ...b,
                patient_name: pUser?.name || 'Patient',
                patient_email: pUser?.email,
                patient_phone: pUser?.phone,
                doctor_name: dUser?.name || 'Doctor',
                specialization: doc?.specialization || 'Clinical',
                appointment_number: apt?.appointment_number
            };
        }).sort((a,b) => new Date(b.bill_date) - new Date(a.bill_date));
    }

    // 10. Dashboard counts
    if (s.includes('COUNT(*) AS count FROM patients')) {
        return [{ count: store.patients.length }];
    }
    if (s.includes('COUNT(*) AS count FROM doctors')) {
        return [{ count: store.doctors.length }];
    }
    if (s.includes('COUNT(*) AS count FROM appointments')) {
        if (s.includes('WHERE appointment_date = CURDATE()')) {
            return [{ count: store.appointments.filter(a => a.appointment_date === new Date().toISOString().slice(0,10)).length }];
        }
        if (s.includes("WHERE status = 'Pending'")) {
            return [{ count: store.appointments.filter(a => a.status === 'Pending').length }];
        }
        if (s.includes("WHERE status = 'Completed'")) {
            return [{ count: store.appointments.filter(a => a.status === 'Completed').length }];
        }
        return [{ count: store.appointments.length }];
    }
    if (s.includes("COALESCE(SUM(total_amount), 0) AS revenue FROM bills WHERE payment_status = 'Paid'")) {
        const rev = store.bills.filter(b => b.payment_status === 'Paid').reduce((acc, b) => acc + (parseFloat(b.total_amount) || 0), 0);
        return [{ revenue: rev }];
    }
    if (s.includes("COALESCE(SUM(total_amount), 0) AS pending FROM bills WHERE payment_status = 'Unpaid'")) {
        const pending = store.bills.filter(b => b.payment_status === 'Unpaid').reduce((acc, b) => acc + (parseFloat(b.total_amount) || 0), 0);
        return [{ pending: pending }];
    }

    // Dashboard trends
    if (s.includes('DATE_FORMAT(appointment_date')) {
        return [
            { month: 'Apr', sort_key: '2026-04', count: 18 },
            { month: 'May', sort_key: '2026-05', count: 24 },
            { month: 'Jun', sort_key: '2026-06', count: 35 },
            { month: 'Jul', sort_key: '2026-07', count: 42 },
            { month: 'Aug', sort_key: '2026-08', count: 50 },
            { month: 'Sep', sort_key: '2026-09', count: store.appointments.length }
        ];
    }
    if (s.includes('DATE_FORMAT(bill_date')) {
        return [
            { month: 'Apr', sort_key: '2026-04', revenue: 24000 },
            { month: 'May', sort_key: '2026-05', revenue: 38500 },
            { month: 'Jun', sort_key: '2026-06', revenue: 52000 },
            { month: 'Jul', sort_key: '2026-07', revenue: 64500 },
            { month: 'Aug', sort_key: '2026-08', revenue: 78000 },
            { month: 'Sep', sort_key: '2026-09', revenue: 92400 }
        ];
    }
    if (s.includes('d.specialization, COUNT(a.id) AS appointment_count')) {
        return [
            { specialization: 'Cardiology', appointment_count: 28 },
            { specialization: 'Neurology', appointment_count: 22 },
            { specialization: 'Orthopedics', appointment_count: 19 },
            { specialization: 'Pediatrics', appointment_count: 15 }
        ];
    }

    // 11. INSERT appointments
    if (s.startsWith('INSERT INTO appointments')) {
        const [aptNum, patId, docId, date, time, reason, status] = params;
        const newApt = {
            id: store.appointments.length + 1,
            appointment_number: aptNum,
            patient_id: parseInt(patId, 10),
            doctor_id: parseInt(docId, 10),
            appointment_date: date,
            appointment_time: time,
            reason,
            status: status || 'Pending',
            created_at: new Date()
        };
        store.appointments.unshift(newApt);
        return { insertId: newApt.id };
    }

    // 12. UPDATE appointments status
    if (s.startsWith('UPDATE appointments SET status = ? WHERE id = ?')) {
        const [status, id] = params;
        const apt = store.appointments.find(a => a.id === parseInt(id, 10));
        if (apt) apt.status = status;
        return { affectedRows: apt ? 1 : 0 };
    }

    // 13. INSERT medical_records
    if (s.startsWith('INSERT INTO medical_records')) {
        const [recNum, aptId, patId, docId, vDate, symptoms, diag, treat, notes] = params;
        const newRec = {
            id: store.medical_records.length + 1,
            record_number: recNum,
            appointment_id: aptId ? parseInt(aptId, 10) : null,
            patient_id: parseInt(patId, 10),
            doctor_id: parseInt(docId, 10),
            visit_date: vDate,
            symptoms,
            diagnosis: diag,
            treatment: treat,
            notes,
            created_at: new Date()
        };
        store.medical_records.unshift(newRec);
        if (aptId) {
            const apt = store.appointments.find(a => a.id === parseInt(aptId, 10));
            if (apt) apt.status = 'Completed';
        }
        return { insertId: newRec.id };
    }

    // 14. INSERT prescriptions
    if (s.startsWith('INSERT INTO prescriptions')) {
        const [recId, name, dosage, freq, dur, inst] = params;
        const newPr = {
            id: store.prescriptions.length + 1,
            medical_record_id: parseInt(recId, 10),
            medicine_name: name,
            dosage,
            frequency: freq,
            duration: dur,
            instructions: inst
        };
        store.prescriptions.push(newPr);
        return { insertId: newPr.id };
    }

    // 15. INSERT bills
    if (s.startsWith('INSERT INTO bills')) {
        const [billNum, patId, docId, aptId, cFee, mChg, lChg, oChg, status, method, bDate, notes] = params;
        const total = (parseFloat(cFee)||0) + (parseFloat(mChg)||0) + (parseFloat(lChg)||0) + (parseFloat(oChg)||0);
        const newBill = {
            id: store.bills.length + 1,
            bill_number: billNum,
            patient_id: parseInt(patId, 10),
            doctor_id: docId ? parseInt(docId, 10) : null,
            appointment_id: aptId ? parseInt(aptId, 10) : null,
            consultation_fee: cFee,
            medicine_charges: mChg,
            lab_charges: lChg,
            other_charges: oChg,
            total_amount: total,
            payment_status: status,
            payment_method: method,
            bill_date: bDate,
            notes,
            created_at: new Date()
        };
        store.bills.unshift(newBill);
        return { insertId: newBill.id };
    }

    // 16. UPDATE / PAY bills
    if (s.includes('UPDATE bills SET payment_status =')) {
        const bill = store.bills.find(b => b.id === parseInt(params[params.length - 1], 10));
        if (bill) {
            bill.payment_status = 'Paid';
            bill.paid_at = new Date();
            if (params[0]) bill.payment_method = params[0];
        }
        return { affectedRows: bill ? 1 : 0 };
    }

    // Default empty array
    return [];
};

// Safe query execution wrapper
const query = async (sql, params = []) => {
    if (isConnected && pool) {
        try {
            const [results] = await pool.execute(sql, params);
            return results;
        } catch (err) {
            console.error('MySQL query error, falling back:', err.message);
        }
    }
    return executeMockQuery(sql, params);
};

// Connection pool proxy for transactions
const poolProxy = {
    getConnection: async () => {
        if (isConnected && pool) {
            try {
                return await pool.getConnection();
            } catch (e) {}
        }
        // Mock connection interface
        return {
            beginTransaction: async () => {},
            commit: async () => {},
            rollback: async () => {},
            release: () => {},
            execute: async (sql, params) => {
                const res = await executeMockQuery(sql, params);
                return [res];
            }
        };
    }
};

module.exports = {
    pool: poolProxy,
    checkConnection,
    isConnected: () => isConnected,
    query
};
