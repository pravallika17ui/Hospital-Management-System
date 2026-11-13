-- =============================================================================
-- Hospital Management System (HMS) - Database Schema & Sample Data
-- Database: hospital_db
-- Target: MySQL 8.0+
-- =============================================================================

CREATE DATABASE IF NOT EXISTS `hospital_db` 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE `hospital_db`;

-- Disable foreign key checks during schema re-creation
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS `payments`;
DROP TABLE IF EXISTS `bills`;
DROP TABLE IF EXISTS `prescriptions`;
DROP TABLE IF EXISTS `medical_records`;
DROP TABLE IF EXISTS `appointments`;
DROP TABLE IF EXISTS `doctors`;
DROP TABLE IF EXISTS `patients`;
DROP TABLE IF EXISTS `users`;

SET FOREIGN_KEY_CHECKS = 1;

-- =============================================================================
-- 1. USERS TABLE
-- Base table for authentication and role-based authorization
-- =============================================================================
CREATE TABLE `users` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(100) NOT NULL,
    `email` VARCHAR(100) NOT NULL UNIQUE,
    `password` VARCHAR(255) NOT NULL,
    `role` ENUM('admin', 'doctor', 'patient') NOT NULL DEFAULT 'patient',
    `phone` VARCHAR(20) DEFAULT NULL,
    `status` ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_users_email` (`email`),
    INDEX `idx_users_role` (`role`),
    INDEX `idx_users_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- 2. PATIENTS TABLE
-- Extended profile details for users with role='patient'
-- =============================================================================
CREATE TABLE `patients` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NOT NULL UNIQUE,
    `dob` DATE DEFAULT NULL,
    `gender` ENUM('Male', 'Female', 'Other') NOT NULL,
    `blood_group` ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-') DEFAULT NULL,
    `address` TEXT DEFAULT NULL,
    `emergency_contact` VARCHAR(20) DEFAULT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT `fk_patients_user` 
        FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) 
        ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX `idx_patients_user` (`user_id`),
    INDEX `idx_patients_blood_group` (`blood_group`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- 3. DOCTORS TABLE
-- Extended profile details for users with role='doctor'
-- =============================================================================
CREATE TABLE `doctors` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NOT NULL UNIQUE,
    `specialization` VARCHAR(100) NOT NULL,
    `qualification` VARCHAR(150) NOT NULL,
    `experience_years` INT NOT NULL DEFAULT 0,
    `consultation_fee` DECIMAL(10, 2) NOT NULL DEFAULT 500.00,
    `available_days` VARCHAR(150) NOT NULL DEFAULT 'Monday,Tuesday,Wednesday,Thursday,Friday',
    `available_time_start` TIME NOT NULL DEFAULT '09:00:00',
    `available_time_end` TIME NOT NULL DEFAULT '17:00:00',
    `slot_duration_minutes` INT NOT NULL DEFAULT 30,
    `bio` TEXT DEFAULT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT `fk_doctors_user` 
        FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) 
        ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX `idx_doctors_user` (`user_id`),
    INDEX `idx_doctors_specialization` (`specialization`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- 4. APPOINTMENTS TABLE
-- Booking records linking patients to doctors with time slot & conflict tracking
-- =============================================================================
CREATE TABLE `appointments` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `appointment_number` VARCHAR(30) NOT NULL UNIQUE,
    `patient_id` INT NOT NULL,
    `doctor_id` INT NOT NULL,
    `appointment_date` DATE NOT NULL,
    `appointment_time` TIME NOT NULL,
    `reason` TEXT NOT NULL,
    `status` ENUM('Pending', 'Confirmed', 'Completed', 'Cancelled') NOT NULL DEFAULT 'Pending',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT `fk_appointments_patient` 
        FOREIGN KEY (`patient_id`) REFERENCES `patients` (`id`) 
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `fk_appointments_doctor` 
        FOREIGN KEY (`doctor_id`) REFERENCES `doctors` (`id`) 
        ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX `idx_apt_patient` (`patient_id`),
    INDEX `idx_apt_doctor` (`doctor_id`),
    INDEX `idx_apt_date` (`appointment_date`),
    INDEX `idx_apt_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- 5. MEDICAL RECORDS TABLE
-- Clinical encounter information documented by doctors
-- =============================================================================
CREATE TABLE `medical_records` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `record_number` VARCHAR(30) NOT NULL UNIQUE,
    `appointment_id` INT DEFAULT NULL,
    `patient_id` INT NOT NULL,
    `doctor_id` INT NOT NULL,
    `visit_date` DATE NOT NULL,
    `symptoms` TEXT NOT NULL,
    `diagnosis` TEXT NOT NULL,
    `treatment` TEXT NOT NULL,
    `notes` TEXT DEFAULT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT `fk_medrec_appointment` 
        FOREIGN KEY (`appointment_id`) REFERENCES `appointments` (`id`) 
        ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT `fk_medrec_patient` 
        FOREIGN KEY (`patient_id`) REFERENCES `patients` (`id`) 
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `fk_medrec_doctor` 
        FOREIGN KEY (`doctor_id`) REFERENCES `doctors` (`id`) 
        ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX `idx_medrec_patient` (`patient_id`),
    INDEX `idx_medrec_doctor` (`doctor_id`),
    INDEX `idx_medrec_date` (`visit_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- 6. PRESCRIPTIONS TABLE
-- Medication items tied to a specific medical record
-- =============================================================================
CREATE TABLE `prescriptions` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `medical_record_id` INT NOT NULL,
    `medicine_name` VARCHAR(150) NOT NULL,
    `dosage` VARCHAR(100) NOT NULL,
    `frequency` VARCHAR(100) NOT NULL,
    `duration` VARCHAR(100) NOT NULL,
    `instructions` VARCHAR(255) DEFAULT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `fk_prescriptions_record` 
        FOREIGN KEY (`medical_record_id`) REFERENCES `medical_records` (`id`) 
        ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX `idx_presc_record` (`medical_record_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- 7. BILLS TABLE
-- Invoices generated with itemized fees and auto-calculated total
-- =============================================================================
CREATE TABLE `bills` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `bill_number` VARCHAR(30) NOT NULL UNIQUE,
    `patient_id` INT NOT NULL,
    `appointment_id` INT DEFAULT NULL,
    `doctor_id` INT DEFAULT NULL,
    `consultation_fee` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    `medicine_charges` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    `lab_charges` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    `other_charges` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    `total_amount` DECIMAL(10, 2) GENERATED ALWAYS AS (
        `consultation_fee` + `medicine_charges` + `lab_charges` + `other_charges`
    ) STORED,
    `payment_status` ENUM('Unpaid', 'Paid', 'Partially Paid') NOT NULL DEFAULT 'Unpaid',
    `payment_method` ENUM('Cash', 'Card', 'UPI', 'Insurance', 'Net Banking') DEFAULT NULL,
    `bill_date` DATE NOT NULL,
    `paid_at` TIMESTAMP NULL DEFAULT NULL,
    `notes` TEXT DEFAULT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT `fk_bills_patient` 
        FOREIGN KEY (`patient_id`) REFERENCES `patients` (`id`) 
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `fk_bills_appointment` 
        FOREIGN KEY (`appointment_id`) REFERENCES `appointments` (`id`) 
        ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT `fk_bills_doctor` 
        FOREIGN KEY (`doctor_id`) REFERENCES `doctors` (`id`) 
        ON DELETE SET NULL ON UPDATE CASCADE,
    INDEX `idx_bills_patient` (`patient_id`),
    INDEX `idx_bills_status` (`payment_status`),
    INDEX `idx_bills_date` (`bill_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- 8. PAYMENTS TABLE
-- Transaction log for payments processed against bills
-- =============================================================================
CREATE TABLE `payments` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `bill_id` INT NOT NULL,
    `transaction_id` VARCHAR(50) NOT NULL UNIQUE,
    `amount` DECIMAL(10, 2) NOT NULL,
    `payment_method` ENUM('Cash', 'Card', 'UPI', 'Insurance', 'Net Banking') NOT NULL,
    `payment_date` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `status` ENUM('Success', 'Failed', 'Pending') NOT NULL DEFAULT 'Success',
    CONSTRAINT `fk_payments_bill` 
        FOREIGN KEY (`bill_id`) REFERENCES `bills` (`id`) 
        ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX `idx_payments_bill` (`bill_id`),
    INDEX `idx_payments_tx` (`transaction_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- SAMPLE DATA INSERTION
-- Pre-hashed password for 'Password@123' using bcrypt ($2a$10$cm7krR9QBpR6tN/nyIKDd.EyFT.NKQoVJ.9MZP6Vpy5ICzhjN852m)
-- =============================================================================

-- Seed Users: 1 Admin, 4 Doctors, 4 Patients
INSERT INTO `users` (`id`, `name`, `email`, `password`, `role`, `phone`, `status`) VALUES
-- 1. System Admin
(1, 'Admin Dr. Arvind Mehta', 'admin@hospital.com', '$2a$10$cm7krR9QBpR6tN/nyIKDd.EyFT.NKQoVJ.9MZP6Vpy5ICzhjN852m', 'admin', '+91 98765 43210', 'active'),

-- 2-5. Doctors
(2, 'Dr. Rajesh Sharma', 'dr.sharma@hospital.com', '$2a$10$cm7krR9QBpR6tN/nyIKDd.EyFT.NKQoVJ.9MZP6Vpy5ICzhjN852m', 'doctor', '+91 98765 11111', 'active'),
(3, 'Dr. Anita Desai', 'dr.anita@hospital.com', '$2a$10$cm7krR9QBpR6tN/nyIKDd.EyFT.NKQoVJ.9MZP6Vpy5ICzhjN852m', 'doctor', '+91 98765 22222', 'active'),
(4, 'Dr. Vikram Reddy', 'dr.vikram@hospital.com', '$2a$10$cm7krR9QBpR6tN/nyIKDd.EyFT.NKQoVJ.9MZP6Vpy5ICzhjN852m', 'doctor', '+91 98765 33333', 'active'),
(5, 'Dr. Sneha Kapoor', 'dr.sneha@hospital.com', '$2a$10$cm7krR9QBpR6tN/nyIKDd.EyFT.NKQoVJ.9MZP6Vpy5ICzhjN852m', 'doctor', '+91 98765 44444', 'active'),

-- 6-9. Patients
(6, 'Rahul Patel', 'rahul.patel@gmail.com', '$2a$10$cm7krR9QBpR6tN/nyIKDd.EyFT.NKQoVJ.9MZP6Vpy5ICzhjN852m', 'patient', '+91 91234 56780', 'active'),
(7, 'Priya Verma', 'priya.verma@gmail.com', '$2a$10$cm7krR9QBpR6tN/nyIKDd.EyFT.NKQoVJ.9MZP6Vpy5ICzhjN852m', 'patient', '+91 91234 56781', 'active'),
(8, 'Amit Kumar', 'amit.kumar@gmail.com', '$2a$10$cm7krR9QBpR6tN/nyIKDd.EyFT.NKQoVJ.9MZP6Vpy5ICzhjN852m', 'patient', '+91 91234 56782', 'active'),
(9, 'Sunita Rao', 'sunita.rao@gmail.com', '$2a$10$cm7krR9QBpR6tN/nyIKDd.EyFT.NKQoVJ.9MZP6Vpy5ICzhjN852m', 'patient', '+91 91234 56783', 'active');

-- Seed Doctor Profiles
INSERT INTO `doctors` (`id`, `user_id`, `specialization`, `qualification`, `experience_years`, `consultation_fee`, `available_days`, `available_time_start`, `available_time_end`, `slot_duration_minutes`, `bio`) VALUES
(1, 2, 'Cardiology', 'MBBS, MD (General Medicine), DM (Cardiology)', 14, 800.00, 'Monday,Tuesday,Wednesday,Thursday,Friday', '09:00:00', '14:00:00', 30, 'Senior Interventional Cardiologist specializing in coronary angiography, heart failure management, and preventive cardiology.'),
(2, 3, 'Neurology', 'MBBS, MD (Medicine), DM (Neurology)', 11, 900.00, 'Monday,Wednesday,Friday,Saturday', '10:00:00', '16:00:00', 30, 'Consultant Neurologist expert in stroke care, epilepsy, headache disorders, and neuro-rehabilitation.'),
(3, 4, 'Orthopedics', 'MBBS, MS (Orthopedics), Fellowship in Joint Replacement', 9, 700.00, 'Tuesday,Thursday,Saturday', '09:30:00', '15:30:00', 30, 'Specialist in robotic knee and hip replacements, arthroscopy, sports trauma, and spine surgery.'),
(4, 5, 'Pediatrics', 'MBBS, MD (Pediatrics), DCH', 8, 600.00, 'Monday,Tuesday,Wednesday,Thursday,Friday,Saturday', '09:00:00', '13:00:00', 30, 'Dedicated pediatrician committed to child development, neonatal critical care, and adolescent immunization.');

-- Seed Patient Profiles
INSERT INTO `patients` (`id`, `user_id`, `dob`, `gender`, `blood_group`, `address`, `emergency_contact`) VALUES
(1, 6, '1992-04-15', 'Male', 'O+', 'Flat 402, Green Valley Apts, MG Road, Bengaluru', '+91 98111 22334'),
(2, 7, '1996-08-22', 'Female', 'B+', 'Plot 18, Lake View Residency, Jubilee Hills, Hyderabad', '+91 98222 33445'),
(3, 8, '1985-11-03', 'Male', 'A+', 'House 12B, Sector 14, Gurugram, Haryana', '+91 98333 44556'),
(4, 9, '1978-01-30', 'Female', 'AB+', 'Apt 203, Sunrise Heights, Kothrud, Pune', '+91 98444 55667');

-- Seed Appointments
INSERT INTO `appointments` (`id`, `appointment_number`, `patient_id`, `doctor_id`, `appointment_date`, `appointment_time`, `reason`, `status`) VALUES
(1, 'APT-20260901-001', 1, 1, CURDATE() - INTERVAL 5 DAY, '09:30:00', 'Chest discomfort and shortness of breath during exertion', 'Completed'),
(2, 'APT-20260902-002', 2, 2, CURDATE() - INTERVAL 3 DAY, '10:30:00', 'Chronic migraine and visual auras lasting over 2 hours', 'Completed'),
(3, 'APT-20260905-003', 3, 3, CURDATE() - INTERVAL 1 DAY, '11:00:00', 'Severe right knee pain after athletic practice', 'Completed'),
(4, 'APT-20260908-004', 4, 1, CURDATE(), '10:00:00', 'Routine post-hypertension quarterly follow up', 'Confirmed'),
(5, 'APT-20260909-005', 1, 3, CURDATE() + INTERVAL 1 DAY, '10:00:00', 'Lower back stiffness and persistent spine tenderness', 'Pending'),
(6, 'APT-20260910-006', 2, 4, CURDATE() + INTERVAL 2 DAY, '11:30:00', 'Pediatric checkup and seasonal allergy consultation for child', 'Pending');

-- Seed Medical Records
INSERT INTO `medical_records` (`id`, `record_number`, `appointment_id`, `patient_id`, `doctor_id`, `visit_date`, `symptoms`, `diagnosis`, `treatment`, `notes`) VALUES
(1, 'MED-20260901-001', 1, 1, 1, CURDATE() - INTERVAL 5 DAY, 
 'Retrosternal chest heaviness on climbing stairs, mild fatigue, BP 142/92 mmHg', 
 'Stage 1 Essential Hypertension with exertional angina pectoris', 
 'Initiated beta-blocker and ACE-inhibitor therapy. Recommended 2D-Echocardiogram and lipid profile test.', 
 'Patient advised to adhere to a low-sodium diet (<2g/day) and perform 30 min daily brisk walking. Review in 3 weeks.'),

(2, 'MED-20260902-002', 2, 2, 2, CURDATE() - INTERVAL 3 DAY, 
 'Unilateral throbbing frontotemporal headache, photophobia, nausea', 
 'Classic Migraine with sensory aura', 
 'Prescribed acute abortive triptan therapy along with prophylactic flunarizine.', 
 'Maintain a headache trigger diary. Avoid skipped meals and erratic sleep schedules.'),

(3, 'MED-20260905-003', 3, 3, 3, CURDATE() - INTERVAL 1 DAY, 
 'Right knee swelling, joint line tenderness, restricted terminal flexion', 
 'Grade II Medial Meniscal Tear (Right Knee)', 
 'Cold compression, brace immobilization for 10 days, NSAID anti-inflammatory course and physiotherapeutic quad strengthening.', 
 'Advised knee MRI scan if symptoms persist beyond 14 days. Avoid deep squats.');

-- Seed Prescriptions
INSERT INTO `prescriptions` (`id`, `medical_record_id`, `medicine_name`, `dosage`, `frequency`, `duration`, `instructions`) VALUES
(1, 1, 'Telmisartan', '40 mg', '1-0-0 (Morning)', '30 Days', 'Take after breakfast with water'),
(2, 1, 'Metoprolol Succinate', '25 mg', '1-0-0 (Morning)', '30 Days', 'Do not discontinue abruptly'),
(3, 1, 'Atorvastatin', '10 mg', '0-0-1 (Night)', '30 Days', 'Take after dinner'),

(4, 2, 'Rizatriptan', '10 mg', 'As needed', '5 Days', 'Take immediately at the onset of migraine aura'),
(5, 2, 'Flunarizine', '10 mg', '0-0-1 (Night)', '60 Days', 'Take before bedtime for migraine prevention'),

(6, 3, 'Aceclofenac + Paracetamol', '100mg / 325mg', '1-0-1 (Twice daily)', '7 Days', 'Take with meals to prevent gastric irritation'),
(7, 3, 'Thiocolchicoside', '4 mg', '1-0-1 (Twice daily)', '5 Days', 'Muscle relaxant, avoid driving if drowsy'),
(8, 3, 'Pantoprazole', '40 mg', '1-0-0 (Morning)', '7 Days', 'Take on empty stomach 30 mins before breakfast');

-- Seed Bills
INSERT INTO `bills` (`id`, `bill_number`, `patient_id`, `appointment_id`, `doctor_id`, `consultation_fee`, `medicine_charges`, `lab_charges`, `other_charges`, `payment_status`, `payment_method`, `bill_date`, `paid_at`, `notes`) VALUES
(1, 'INV-20260901-001', 1, 1, 1, 800.00, 650.00, 1200.00, 150.00, 'Paid', 'UPI', CURDATE() - INTERVAL 5 DAY, NOW() - INTERVAL 5 DAY, 'OPD consultation + 2D Echo screening + ECG charges'),
(2, 'INV-20260902-002', 2, 2, 2, 900.00, 480.00, 0.00, 50.00, 'Paid', 'Card', CURDATE() - INTERVAL 3 DAY, NOW() - INTERVAL 3 DAY, 'Neuro consultation and prophylactic medication dispensation'),
(3, 'INV-20260905-003', 3, 3, 3, 700.00, 320.00, 850.00, 200.00, 'Paid', 'Cash', CURDATE() - INTERVAL 1 DAY, NOW() - INTERVAL 1 DAY, 'Orthopedic examination + Knee X-Ray (AP/Lat) + Knee brace'),
(4, 'INV-20260908-004', 4, 4, 1, 800.00, 0.00, 500.00, 50.00, 'Unpaid', NULL, CURDATE(), NULL, 'Cardiac OPD follow-up and basic metabolic panel');

-- Seed Payments
INSERT INTO `payments` (`id`, `bill_id`, `transaction_id`, `amount`, `payment_method`, `payment_date`, `status`) VALUES
(1, 1, 'TXN-UPI-20260901-8841', 2800.00, 'UPI', NOW() - INTERVAL 5 DAY, 'Success'),
(2, 2, 'TXN-CRD-20260902-1294', 1430.00, 'Card', NOW() - INTERVAL 3 DAY, 'Success'),
(3, 3, 'TXN-CSH-20260905-4921', 2070.00, 'Cash', NOW() - INTERVAL 1 DAY, 'Success');
