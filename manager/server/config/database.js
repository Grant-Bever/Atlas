const { Sequelize } = require('sequelize');

// Get database configuration from environment variables
const {
  DB_NAME = 'atlas_timesheet',
  DB_USER = 'postgres',
  DB_PASSWORD = 'postgres',
  DB_HOST = 'localhost',
  DB_PORT = 5432,
  NODE_ENV = 'development'
} = process.env;

// Create Sequelize instance
const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
  host: DB_HOST,
  port: DB_PORT,
  dialect: 'postgres',
  logging: NODE_ENV === 'development' ? console.log : false,
  timezone: '-04:00', // Eastern Time
});

module.exports = {
  sequelize,
  Sequelize
}; 