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

// TODO: Implement loginManager service function

module.exports = {
  createManager,
}; 