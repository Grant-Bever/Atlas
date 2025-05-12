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

// Function to log in a customer
async function loginCustomer(email, password) {
  try {
    const customer = await Customer.findOne({ where: { email } });
    if (!customer) {
      return { success: false, message: 'Customer not found.' };
    }

    const isValidPassword = await customer.validatePassword(password);
    if (!isValidPassword) {
      return { success: false, message: 'Invalid password.' };
    }

    // Login successful - return customer data (excluding password)
    // In a real app, you'd generate and return a JWT here
    const { password_hash, ...customerData } = customer.get({ plain: true });
    return { success: true, customer: customerData };

  } catch (error) {
    console.error('Error in loginCustomer service:', error);
    throw error; // Or return a structured error object
  }
}

module.exports = {
  createCustomer,
  loginCustomer
}; 