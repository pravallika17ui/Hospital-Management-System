const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { checkConnection } = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:3000'],
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root route & Health check
app.get('/', (req, res) => {
    res.json({
        name: 'Hospital Management System REST API',
        version: '1.0.0',
        status: 'Online',
        documentation: '/api/health'
    });
});

app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'HMS Backend API is running smoothly.',
        timestamp: new Date().toISOString()
    });
});

// API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/patients', require('./routes/patientRoutes'));
app.use('/api/doctors', require('./routes/doctorRoutes'));
app.use('/api/appointments', require('./routes/appointmentRoutes'));
app.use('/api/medical-records', require('./routes/medicalRecordRoutes'));
app.use('/api/bills', require('./routes/billingRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));
app.use('/api/users', require('./routes/userRoutes'));

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Start server
app.listen(PORT, async () => {
    console.log(`=======================================================`);
    console.log(`🏥 Hospital Management System API Server`);
    console.log(`🚀 Server listening on: http://localhost:${PORT}`);
    console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`=======================================================`);

    // Verify database connection
    await checkConnection();
});

module.exports = app;
