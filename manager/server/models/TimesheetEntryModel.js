const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class TimesheetEntry extends Model {
    static associate(models) {
      // An entry belongs to one Employee
      TimesheetEntry.belongsTo(models.Employee, {
        foreignKey: 'employee_id',
        as: 'employee'
      });
    }
  }
  TimesheetEntry.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    employee_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'employees', // table name
        key: 'id'
      }
    },
    clockInTime: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'clock_in_time' // Ensure snake_case in DB
    },
    clockOutTime: {
      type: DataTypes.DATE,
      allowNull: true, // Might be null if currently clocked in
      field: 'clock_out_time'
    },
    // Optional: Add fields like 'break_duration' if needed
  }, {
    sequelize,
    modelName: 'TimesheetEntry',
    tableName: 'timesheet_entries',
    timestamps: true, // Use Sequelize timestamps (createdAt, updatedAt)
    underscored: true // Use snake_case for automatic fields (createdAt -> created_at)
  });
  return TimesheetEntry;
}; 