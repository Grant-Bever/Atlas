const { Customer } = require('../models'); // Assuming Customer model is exported from models/index.js

async function createCustomer(customerData) {
  try {
    // Password will be hashed by the Sequelize hook in CustomerManagerModel.js
    // Phone number is already encrypted by the controller.
    const newCustomer = await Customer.create(customerData);
    return newCustomer;
  } catch (error) {
    console.error('Error creating customer in service:', error);
    throw error;
  }
}

// TODO: Implement loginCustomer service function

module.exports = {
  createCustomer,
}; 