const { Sequelize } = require('sequelize');

// Environment variables will be injected by Cloud Run/Cloud Build
const dbName = process.env.DB_NAME;
const dbUser = process.env.DB_USER;
const dbPassword = process.env.DB_PASS; // Provided by Secret Manager via Cloud Run
const dbHostSocketPath = process.env.DB_HOST; // Provided by Cloud Run (e.g., /cloudsql/project:region:instance)

console.log(`DB_NAME: ${dbName}`);
console.log(`DB_USER: ${dbUser}`);
console.log(`DB_PASS is set: ${!!dbPassword}`); // Log if password is set, not the value
console.log(`DB_HOST (socket path): ${dbHostSocketPath}`);

if (!dbName || !dbUser || !dbPassword || !dbHostSocketPath) {
  console.error('CRITICAL: Database configuration environment variables (DB_NAME, DB_USER, DB_PASS, DB_HOST) must all be set.');
  process.exit(1);
}

const sequelizeOptions = {
  dialect: 'postgres',
  logging: false, // Set to console.log to see SQL queries, or false to disable
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
};

// Set the host directly to the socket path directory for pg driver
if (dbHostSocketPath) {
  sequelizeOptions.host = dbHostSocketPath;
  console.log(`Sequelize configured to use socket via host: ${dbHostSocketPath}`);
} else {
  // This case should ideally not happen due to the check above, but as a fallback:
  console.error('CRITICAL: DB_HOST (socket path) is not defined. Sequelize will likely fail to connect or use defaults.');
  // Do NOT set host/port here to avoid defaulting to localhost if socket is intended
}

const sequelize = new Sequelize(dbName, dbUser, dbPassword, sequelizeOptions);

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