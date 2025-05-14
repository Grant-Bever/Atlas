const { Sequelize } = require('sequelize');

// Environment variables will be loaded from .env or injected by Cloud Run/Cloud Build
const dbName = process.env.DB_NAME;
const dbUser = process.env.DB_USER;
const dbPassword = process.env.DB_PASSWORD || process.env.DB_PASS; // Support both formats
const dbHostSocketPath = process.env.DB_HOST; // Could be a socket path for Cloud SQL or a hostname
const dbPort = process.env.DB_PORT || 5432; // Default PostgreSQL port

const isProduction = process.env.NODE_ENV === 'production';
const isCloudSql = dbHostSocketPath && dbHostSocketPath.includes('/cloudsql/');

console.log(`Environment: ${isProduction ? 'Production' : 'Development'}`);
console.log(`DB_NAME: ${dbName}`);
console.log(`DB_USER: ${dbUser}`);
console.log(`DB_PASS/PASSWORD is set: ${!!dbPassword}`); // Log if password is set, not the value
console.log(`DB_HOST: ${dbHostSocketPath}`);
console.log(`DB_PORT: ${dbPort}`);
console.log(`Using Cloud SQL socket: ${isCloudSql}`);

if (!dbName || !dbUser || !dbPassword || !dbHostSocketPath) {
  console.error('WARNING: Some database configuration environment variables are missing. Database connection may fail.');
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

// Configure connection based on environment
if (isCloudSql) {
  // Cloud SQL with socket
  sequelizeOptions.host = dbHostSocketPath;
  console.log(`Sequelize configured to use Cloud SQL socket: ${dbHostSocketPath}`);
} else {
  // Regular TCP connection (local development or other)
  sequelizeOptions.host = dbHostSocketPath; // Usually 'localhost' in dev
  sequelizeOptions.port = dbPort;
  console.log(`Sequelize configured to use TCP connection: ${dbHostSocketPath}:${dbPort}`);
}

// Create Sequelize instance
const sequelize = new Sequelize(dbName, dbUser, dbPassword, sequelizeOptions);

// Test the connection (optional - can be called during app startup if needed)
async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');
    return true;
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    return false;
  }
}

// Export both the sequelize instance and the test function
module.exports = sequelize; 