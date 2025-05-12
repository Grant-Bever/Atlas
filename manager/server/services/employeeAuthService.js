const { Employee } = require('../models'); // Assuming Employee model is exported from models/index.js

async function createEmployee(employeeData) {
  try {
    // Password will be hashed by the Sequelize hook in EmployeeManagerModel.js
    // Phone number is already encrypted by the controller.
    const newEmployee = await Employee.create(employeeData);
    return newEmployee;
  } catch (error) {
    console.error('Error creating employee in service:', error);
    throw error;
  }
}

// TODO: Implement loginEmployee service function

module.exports = {
  createEmployee,
}; 