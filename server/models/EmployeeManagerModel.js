const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Employee extends Model {
    static associate(models) {
      Employee.hasMany(models.Workday, { foreignKey: 'employee_id', as: 'workdays' });
      Employee.hasMany(models.TimesheetEntry, {
        foreignKey: 'employee_id',
        as: 'timesheetEntries'
      });
      Employee.hasMany(models.WeeklyTimesheetStatus, {
        foreignKey: 'employee_id',
        as: 'weeklyStatuses'
      });
    }
  }
  Employee.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    phone: {
      type: DataTypes.STRING(20)
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false
      // Consider adding hooks for password hashing (bcrypt) before saving
    },
    hourly_rate: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true // Or false depending on requirements, can be set during onboarding
    },
    is_active: { // New field
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      field: 'is_active'
    },
    fired_at: { // New field
      type: DataTypes.DATE,
      allowNull: true, // Null when active
      field: 'fired_at'
    }
  }, {
    sequelize,
    modelName: 'Employee',
    tableName: 'employees',
    timestamps: false // Assuming no created_at/updated_at needed for employee itself
  });
  return Employee;
}; 