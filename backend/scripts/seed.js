const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '../.env') });

const seedDatabase = async () => {
    console.log('🚀 [HMS Database Initializer]');
    console.log(`Connecting to MySQL host: ${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || 3306}...`);

    let connection;
    try {
        // Connect to server (without DB selected first to allow CREATE DATABASE)
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            port: parseInt(process.env.DB_PORT, 10) || 3306,
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            multipleStatements: true
        });

        console.log('✅ Connected to MySQL server.');

        const sqlFilePath = path.join(__dirname, '../../database/hospital.sql');
        if (!fs.existsSync(sqlFilePath)) {
            throw new Error(`SQL file not found at: ${sqlFilePath}`);
        }

        console.log(`📖 Reading SQL schema from: ${sqlFilePath}...`);
        const sql = fs.readFileSync(sqlFilePath, 'utf8');

        console.log('⚡ Executing schema and seed queries...');
        await connection.query(sql);

        console.log('🎉 [Success] Database `hospital_db` and tables created with sample data seeded!');
        console.log('-------------------------------------------------------');
        console.log('Sample Accounts Ready:');
        console.log('👑 Admin:   admin@hospital.com   / Password@123');
        console.log('🩺 Doctor:  dr.sharma@hospital.com / Password@123');
        console.log('🩺 Doctor:  dr.anita@hospital.com  / Password@123');
        console.log('🩺 Doctor:  dr.vikram@hospital.com / Password@123');
        console.log('🩺 Doctor:  dr.sneha@hospital.com  / Password@123');
        console.log('👤 Patient: rahul.patel@gmail.com / Password@123');
        console.log('👤 Patient: priya.verma@gmail.com / Password@123');
        console.log('-------------------------------------------------------');
    } catch (err) {
        console.error('❌ [Database Setup Error]:', err.message);
        console.log('\nTip: Check that MySQL is running and password matches in backend/.env');
        process.exit(1);
    } finally {
        if (connection) await connection.end();
    }
};

seedDatabase();
