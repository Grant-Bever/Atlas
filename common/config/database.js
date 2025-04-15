const { Sequelize } = require('sequelize');
const path = require('path'); // Import path module

// Load environment variables from the specific .env file location
require('dotenv').config({ path: path.resolve(__dirname, '../../manager/server/.env') });

// It's best practice to use environment variables for sensitive data
const dbName = process.env.DB_NAME || 'AtlasDB'; // Use your database name
const dbUser = process.env.DB_USER || 'postgres'; // Use your PostgreSQL username
const dbPassword = process.env.DB_PASSWORD || 'your_password'; // Use your PostgreSQL password
const dbHost = process.env.DB_HOST || 'localhost';
const dbPort = process.env.DB_PORT || 5432;

const sequelize = new Sequelize(dbName, dbUser, dbPassword, {
  host: dbHost,
  port: dbPort,
  dialect: 'postgres',
  logging: false, // Set to console.log to see SQL queries, or false to disable
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

// Test the connection (optional but recommended)
async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
}

testConnection();

module.exports = sequelize; 