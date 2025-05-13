const { Sequelize } = require('sequelize');

// Environment variables will be injected by Cloud Run/Cloud Build
const dbName = process.env.DB_NAME;
const dbUser = process.env.DB_USER;
const dbPassword = process.env.DB_PASS; // Provided by Secret Manager via Cloud Run
const dbHostSocketPath = process.env.DB_HOST; // Provided by Cloud Run (e.g., /cloudsql/project:region:instance)

if (!dbName || !dbUser || !dbPassword || !dbHostSocketPath) {
  console.error('Database configuration environment variables (DB_NAME, DB_USER, DB_PASS, DB_HOST) must be set.');
  process.exit(1);
}

const sequelize = new Sequelize(dbName, dbUser, dbPassword, {
  // host: dbHost, // Host is specified via socket path for Cloud SQL Proxy
  // port: dbPort, // Port is not needed for socket path
  dialect: 'postgres',
  dialectOptions: {
    // Use a Unix socket for Cloud SQL Auth Proxy connection
    socketPath: dbHostSocketPath
  },
  logging: false, // Set to console.log to see SQL queries, or false to disable
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

// Test the connection (optional - can be called during app startup if needed)
async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
}

// testConnection(); // Don't call directly here, let the application manage startup checks

module.exports = sequelize; 