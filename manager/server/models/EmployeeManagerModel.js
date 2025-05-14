const bcrypt = require('bcrypt');

module.exports = (sequelize, DataTypes) => {
  const Employee = sequelize.define('Employee', {
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
    encrypted_phone_number: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    password_hash: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    hourly_rate: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      defaultValue: 15.00
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
    },
    role: { // Added role field
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'employee' // Managers will need this explicitly set to 'manager'
    }
  }, {
    modelName: 'Employee',
    tableName: 'employees',
    timestamps: true,
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

  Employee.prototype.validatePassword = async function(password) {
    return bcrypt.compare(password, this.password_hash);
  };

  Employee.associate = (models) => {
    Employee.hasMany(models.Workday, { foreignKey: 'employee_id', as: 'workdays' });
    Employee.hasMany(models.TimesheetEntry, {
      foreignKey: 'employee_id',
      as: 'timesheetEntries'
    });
    Employee.hasMany(models.WeeklyTimesheetStatus, {
      foreignKey: 'employee_id',
      as: 'weeklyStatuses'
    });
  };

  return Employee;
}; 