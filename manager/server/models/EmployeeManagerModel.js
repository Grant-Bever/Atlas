const { Model } = require('sequelize');
const bcrypt = require('bcrypt'); // Make sure bcrypt is installed

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

    // Instance method to validate password
    async validatePassword(password) {
      return bcrypt.compare(password, this.password_hash);
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
    encrypted_phone_number: { // Renamed
      type: DataTypes.STRING(255),
      allowNull: true
    },
    name: { // Assuming 'name' is sufficient; could be split into first_name, last_name
      type: DataTypes.STRING(255),
      allowNull: false
    },
    password_hash: { // Renamed
      type: DataTypes.STRING(255),
      allowNull: false // Reverted to NOT NULL
    },
    hourly_rate: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      field: 'is_active'
    },
    fired_at: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'fired_at'
    }
  }, {
    sequelize,
    modelName: 'Employee',
    tableName: 'employees',
    timestamps: true, // Enabled timestamps
    hooks: {
      beforeCreate: async (employee) => {
        if (employee.password_hash) {
          const salt = await bcrypt.genSalt(10);
          employee.password_hash = await bcrypt.hash(employee.password_hash, salt);
        }
      },
      beforeUpdate: async (employee) => {
        if (employee.changed('password_hash') && employee.password_hash) {
          const salt = await bcrypt.genSalt(10);
          employee.password_hash = await bcrypt.hash(employee.password_hash, salt);
        }
      }
    }
  });
  return Employee;
}; 