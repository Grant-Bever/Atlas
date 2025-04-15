const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
// const sequelize = require('../config/database'); // Old path
// const sequelize = require('../../common/config/database'); // Incorrect path
const sequelize = require('../../../common/config/database'); // Correct path: Up three levels to root, then common/config/database

const db = {};

// Read all files in the current directory (models)
fs.readdirSync(__dirname)
  .filter(file => {
    // Filter out non-JS files, the index file itself, and test files
    return (
      file.indexOf('.') !== 0 &&
      file !== path.basename(__filename) &&
      file.slice(-3) === '.js' &&
      file.indexOf('.test.js') === -1
    );
  })
  .forEach(file => {
    // Import each model file and add it to the db object
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  });

// Set up associations between models
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

// Export Employee specifically if needed elsewhere easily
// db.Employee = require('./EmployeeManagerModel')(sequelize, Sequelize.DataTypes);
// db.TimesheetEntry = require('./TimesheetEntryModel')(sequelize, Sequelize.DataTypes);
// db.WeeklyTimesheetStatus = require('./WeeklyTimesheetStatusModel')(sequelize, Sequelize.DataTypes);

db.sequelize = sequelize; // Add the sequelize instance to the db object
db.Sequelize = Sequelize; // Add the Sequelize library itself

module.exports = db; 