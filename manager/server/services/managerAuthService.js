const { Manager } = require('../models'); // Assuming models/index.js exports all models

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

    // Login successful - return manager data (excluding password)
    const { password_hash, ...managerData } = manager.get({ plain: true });
    return { success: true, manager: managerData };

  } catch (error) {
    console.error('Error in loginManager service:', error);
    throw error;
  }
}

module.exports = {
  createManager,
  loginManager
}; 