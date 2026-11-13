# 🏥 CarePoint Hospital Management System (HMS)

> **A Complete Full-Stack Medical Operations, OPD Scheduling, Electronic Health Records & Billing Platform**  
> *Engineered as a Real-World, Industry-Grade B.Tech Capstone Software Engineering Project.*

---

## 📌 1. Project Overview & Objectives

Modern healthcare institutions require seamless coordination among administrative authorities, clinical medical consultants, and patients. The **CarePoint Hospital Management System** is a responsive, multi-tier web application that unifies:
1. **Patient Care & Self-Service**: Online registration, doctor specialization discovery, real-time slot scheduling, electronic medical dossiers, and online invoice settlement.
2. **Doctor Practice Desk**: Real-time consultation queue, patient history inspection, clinical diagnosis recording, and multi-item e-prescription generation.
3. **Administrative & Financial Control**: Comprehensive hospital analytics, clinician onboarding, appointment monitoring, revenue metrics, and invoice management.

---

## 🏗️ 2. System Architecture

```
[ React 18 + Vite + Tailwind CSS ]  <--- (Browser / Responsive Mobile)
                │
                │ REST API (JSON / JWT Bearer)
                ▼
  [ Node.js + Express REST API ]    <--- (Port 5000)
    ├── JWT Authentication & Role Guards
    ├── Double-Booking Conflict Prevention
    └── Automated Invoice & Revenue Aggregator
                │
                │ MySQL2 / Connection Pool
                ▼
   [ MySQL 8.0 Relational DB ]      <--- (`hospital_db` on Port 3306)
    ├── users, doctors, patients
    ├── appointments, medical_records
    └── prescriptions, bills, payments
```

---

## 🗄️ 3. Database Relational Model & ER Diagram

```
 +--------------------+       1:1       +--------------------+
 |       users        | <-------------> |     patients       |
 |--------------------|                 |--------------------|
 | id (PK)            |                 | id (PK)            |
 | name, email, role  |                 | user_id (FK, UK)   |
 | password, status   |                 | dob, gender, blood |
 +--------------------+                 +--------------------+
           │ 1:1                                  │ 1:N
           ▼                                      ▼
 +--------------------+       1:N       +--------------------+
 |      doctors       | <-------------> |    appointments    |
 |--------------------|                 |--------------------|
 | id (PK)            |                 | id (PK)            |
 | user_id (FK, UK)   |                 | appointment_number |
 | specialization     |                 | patient_id (FK)    |
 | consultation_fee   |                 | doctor_id (FK)     |
 | available_days/time|                 | date, time, status |
 +--------------------+                 +--------------------+
           │ 1:N                                  │ 1:1
           ▼                                      ▼
 +--------------------+                 +--------------------+
 |  medical_records   |                 |       bills        |
 |--------------------|                 |--------------------|
 | id (PK), record_no |                 | id (PK), bill_no   |
 | patient_id (FK)    |                 | patient_id (FK)    |
 | doctor_id (FK)     |                 | doctor_id (FK)     |
 | symptoms, diagnosis|                 | consultation_fee   |
 | treatment, notes   |                 | medicine_charges   |
 +--------------------+                 | lab_charges        |
           │ 1:N                        | total_amount (GEN) |
           ▼                            | payment_status     |
 +--------------------+                 +--------------------+
 |   prescriptions    |                           │ 1:N
 |--------------------|                           ▼
 | id (PK)            |                 +--------------------+
 | medical_record_id  |                 |      payments      |
 | medicine_name      |                 |--------------------|
 | dosage, frequency  |                 | id (PK), amount    |
 | duration, instruct |                 | transaction_id (UK)|
 +--------------------+                 | payment_method     |
                                        +--------------------+
```

---

## 🔑 4. Demo Login Credentials

Quick-fill demo buttons are built directly into the login screen (`/login`) for instant access:

| Role | Email Address | Password | Privileges |
| :--- | :--- | :--- | :--- |
| 👑 **Administrator** | `admin@hospital.com` | `Password@123` | Full dashboard analytics, doctor & patient CRUD, invoice creation, system users |
| 🩺 **Doctor (Cardiology)** | `dr.sharma@hospital.com` | `Password@123` | Practice schedule, patient history, clinical diagnosis, multi-item e-prescriptions |
| 🩺 **Doctor (Neurology)** | `dr.anita@hospital.com` | `Password@123` | Neurological appointments queue, clinical notes |
| 🩺 **Doctor (Orthopedics)** | `dr.vikram@hospital.com` | `Password@123` | Orthopedic consultations & joint replacement follow-ups |
| 👤 **Patient (Rahul)** | `rahul.patel@gmail.com` | `Password@123` | Real-time booking, my appointments, prescription doses, online invoice settlement |
| 👤 **Patient (Priya)** | `priya.verma@gmail.com` | `Password@123` | Appointment status tracking, medical records review |

---

## 💻 5. Technology Stack

### Frontend
- **React.js 18** (Modern functional components, hooks, custom state)
- **Vite** (Lightning-fast HMR and optimized production bundling)
- **Tailwind CSS** (Custom medical theme, clean white cards, clinical cyan accents)
- **Lucide React** (High-legibility medical and dashboard iconography)
- **Axios** (Centralized API client with JWT Bearer request interceptors)
- **React Router Dom v6** (Nested routes, layout wrappers, and role-based guards)

### Backend
- **Node.js & Express.js** (REST API routing, modular controllers)
- **JWT (jsonwebtoken)** (Stateless, encrypted session tokens with 7-day expiry)
- **bcryptjs** (Industry-standard password hashing with salt rounds)
- **MySQL2 / Promise Pool** (High-throughput relational connection pooling)
- **CORS & Dotenv** (Origin whitelist and environment configuration)

### Database
- **MySQL Server 8.0**
- Relational schema with Foreign Keys (`ON DELETE CASCADE`), Indexes, and Generated Columns for billing calculations.

---

## 🚀 6. Installation & Execution Guide

### Prerequisites
- **Node.js** (v18+ or v20+ LTS recommended)
- **MySQL Server 8.0** (or XAMPP / WAMP MySQL)
- **Git** & **VS Code**

---

### Step 1: Clone or Open the Repository
Open the project directory in VS Code:
```bash
cd "Hospital Management System"
```

---

### Step 2: Configure Database & Import Schema

1. Open `backend/.env` in VS Code and set your local MySQL password:
   ```env
   PORT=5000
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=your_actual_mysql_password
   DB_NAME=hospital_db
   JWT_SECRET=hospital_management_system_super_secret_jwt_key_2026
   ```

2. **Automated Seed Command**:
   Run the automated database seeder from the `backend/` directory:
   ```bash
   cd backend
   npm run seed
   ```
   *This automatically creates `hospital_db`, builds all 8 tables with foreign keys, and seeds sample doctors, patients, appointments, medical records, and invoices!*

3. **Alternative Manual Import via MySQL CLI**:
   ```bash
   mysql -u root -p < database/hospital.sql
   ```

---

### Step 3: Run the Backend API Server
```bash
cd backend
npm install
npm run dev   # or: npm start
```
*The server will start on `http://localhost:5000` with the live API routes.*

---

### Step 4: Run the React Frontend Application
Open a new terminal window:
```bash
cd frontend
npm install
npm run dev
```
*The web portal will launch on `http://localhost:5173`.*

---

## 📡 7. REST API Reference

### Authentication (`/api/auth`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register new patient account |
| `POST` | `/api/auth/login` | Public | Authenticate email/password; returns JWT token |
| `GET` | `/api/auth/me` | Authenticated | Retrieve authenticated profile |
| `PUT` | `/api/auth/update-password` | Authenticated | Change current password |

### Doctors (`/api/doctors`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/doctors` | Public | List all doctors with specialty & name search |
| `GET` | `/api/doctors/specializations` | Public | Retrieve unique department specializations |
| `GET` | `/api/doctors/:id` | Public | View detailed profile and consultation fees |
| `GET` | `/api/doctors/:id/available-slots` | Public | Real-time slots for given date (filters out booked slots) |
| `POST` | `/api/doctors` | Admin | Onboard new specialist doctor |
| `PUT` | `/api/doctors/:id` | Admin / Doctor | Update doctor hours and consultation fees |
| `DELETE` | `/api/doctors/:id` | Admin | Remove doctor profile |

### Appointments (`/api/appointments`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/appointments` | Auth (Scoped) | Admin views all; Doctor views assigned; Patient views own |
| `POST` | `/api/appointments` | Patient / Admin | Book appointment (blocks double-booking with 409 Conflict) |
| `PUT` | `/api/appointments/:id/status` | Doctor / Admin / Patient | Update status (`Pending`, `Confirmed`, `Completed`, `Cancelled`) |
| `DELETE` | `/api/appointments/:id` | Admin | Delete appointment record |

### Clinical Medical Records & Prescriptions (`/api/medical-records`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/medical-records` | Auth (Scoped) | Retrieve clinical history records |
| `GET` | `/api/medical-records/:id` | Auth (Scoped) | Detailed diagnosis, notes, and attached prescriptions |
| `POST` | `/api/medical-records` | Doctor / Admin | Document symptoms, diagnosis, treatment, and multi-item Rx |
| `GET` | `/api/medical-records/prescriptions/all` | Patient / Doctor | Direct list of all active medications with dosages |

### Billing & Invoices (`/api/bills`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/bills` | Auth (Scoped) | List invoices (Admin views all; Patient views own) |
| `GET` | `/api/bills/:id` | Auth (Scoped) | Itemized bill breakdown |
| `POST` | `/api/bills` | Admin | Issue invoice (Total = consultation + med + lab + other) |
| `POST` | `/api/bills/:id/pay` | Patient / Admin | Settle invoice online (generates transaction ref) |

### Analytics & Dashboard (`/api/dashboard`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/dashboard/admin` | Admin | KPIs, Monthly revenue trend, appointment volume, specialty breakdown |
| `GET` | `/api/dashboard/doctor` | Doctor | Today's schedule, pending requests, treated patients count |
| `GET` | `/api/dashboard/patient` | Patient | Next appointment reminder, unpaid bills count, records count |

---

## 🛡️ 8. Security & Validation Best Practices

- **Bcrypt Password Encryption**: User passwords hashed with 10 salt rounds; plain-text passwords never stored.
- **Stateless JWT Authorization**: Exchanged via HTTP `Authorization: Bearer <token>` headers.
- **Role Guard Middleware**: Strict server-side validation enforcing that Patients cannot access administrative tools or doctor clinical forms.
- **Double-Booking Prevention**: Database conflict checks prevent two patients from reserving the same doctor on the same date and time slot.
- **SQL Injection Prevention**: Prepared statements (`?` parameters) across all queries.
- **Automated Billing Formula**: Generated stored column ensures billing arithmetic integrity without client-side tampering.

---

## 📁 9. Project Structure

```
Hospital Management System/
├── database/
│   └── hospital.sql              # MySQL DDL schema and sample dataset
│
├── backend/
│   ├── config/
│   │   └── db.js                 # Dual-mode MySQL connection pool & mock engine
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── doctorController.js
│   │   ├── patientController.js
│   │   ├── appointmentController.js
│   │   ├── medicalRecordController.js
│   │   ├── billingController.js
│   │   ├── dashboardController.js
│   │   └── userController.js
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   └── errorMiddleware.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── doctorRoutes.js
│   │   ├── patientRoutes.js
│   │   ├── appointmentRoutes.js
│   │   ├── medicalRecordRoutes.js
│   │   ├── billingRoutes.js
│   │   ├── dashboardRoutes.js
│   │   └── userRoutes.js
│   ├── utils/
│   │   └── helpers.js            # Code generators (APT, MED, INV) & validators
│   ├── scripts/
│   │   └── seed.js               # Auto MySQL seeder script
│   ├── server.js                 # Express server bootstrap
│   ├── .env                      # Local environment configuration
│   ├── .env.example
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/           # Navbar, Footer, Sidebar, Modal, Badge, StatCard
│   │   │   └── charts/           # RevenueChart, AppointmentsChart, SpecialtyDistribution
│   │   ├── context/
│   │   │   └── AuthContext.jsx   # Global login state, role inspection & JWT caching
│   │   ├── layouts/
│   │   │   ├── PublicLayout.jsx  # Public portal wrapper
│   │   │   └── DashboardLayout.jsx # Authenticated sidebar & topbar layout
│   │   ├── pages/
│   │   │   ├── public/           # Home, About, Services, Doctors, Contact, Login, Register
│   │   │   ├── admin/            # AdminDashboard, Doctors, Patients, Appointments, Billing, Records, Users
│   │   │   ├── doctor/           # DoctorDashboard, Appointments, AddMedicalRecord, Patients, Profile
│   │   │   └── patient/          # PatientDashboard, BookAppointment, Appointments, Records, Prescriptions, Bills, Profile
│   │   ├── services/
│   │   │   └── api.js            # Axios service endpoints
│   │   ├── App.jsx               # Role-based protected routes
│   │   ├── main.jsx
│   │   └── index.css             # Tailwind CSS & printing rules
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── package.json
│
└── README.md                     # Comprehensive documentation
```

---

## 🎓 10. B.Tech Capstone Presentation & Viva Highlights

When presenting this project for your academic review, highlight these technical achievements:
1. **Separation of Concerns**: Clean Model-View-Controller (MVC) API backend decoupled from a client-side rendered Single Page Application (SPA).
2. **Transaction Integrity**: Clinical encounters use multi-table transactions to create medical records, insert prescription line items, and mark appointments as completed simultaneously.
3. **Double-Booking Concurrency Control**: Slot conflict detection guarantees two patients cannot book the same specialist at the same time.
4. **Dual-Mode Backend Resilience**: Self-healing connection layer that supports production MySQL and resilient local evaluation without service crashes.
5. **Printable Invoices & Receipts**: Compliant CSS `@media print` rules allowing patients and administrators to print official tax invoices directly from the browser.
