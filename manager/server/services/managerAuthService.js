const { Manager } = require('../models'); // Assuming models/index.js exports all models
const jwt = require('jsonwebtoken'); // Import jsonwebtoken
const bcrypt = require('bcrypt'); // bcrypt might already be in ManagerModel, but good for direct use if needed elsewhere

async function createManager(managerData) {
  try {
    // The password will be hashed by the Sequelize hook in ManagerModel.js
    // The phone number is already encrypted by the controller before being passed here.
    const newManager = await Manager.create(managerData);
    return newManager;
  } catch (error) {
    // Log the error or handle specific database errors if necessary
    console.error('Error creating manager in service:', error);
    throw error; // Re-throw to be caught by the controller
  }
}

// Function to log in a manager
async function loginManager(email, password) {
  try {
    const manager = await Manager.findOne({ where: { email } });
    if (!manager) {
      return { success: false, message: 'Manager not found.' };
    }

    const isValidPassword = await manager.validatePassword(password);
    if (!isValidPassword) {
      return { success: false, message: 'Invalid password.' };
    }

    // Login successful, generate JWT
    const payload = {
      userId: manager.id,
      email: manager.email,
      role: 'manager' // Explicitly set role for the token
      // Add other relevant non-sensitive info if needed
    };

    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET || 'atlas-dev-secret', // Use the same secret as in your middleware
      { expiresIn: '24h' } // Token expiration time (e.g., 1 hour, 24 hours)
    );

    const { password_hash, ...managerData } = manager.get({ plain: true });
    return { success: true, manager: managerData, token: token }; // Return the token

  } catch (error) {
    console.error('Error in loginManager service:', error);
    throw error;
  }
}

module.exports = {
  createManager,
  loginManager
}; 