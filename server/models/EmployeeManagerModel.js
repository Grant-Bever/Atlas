const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Employee extends Model {
    static associate(models) {
      Employee.hasMany(models.Workday, { foreignKey: 'employee_id', as: 'workdays' });
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
      type: DataTypes.DECIMAL(10, 2)
    }
  }, {
    sequelize,
    modelName: 'Employee',
    tableName: 'employees',
    timestamps: false
  });
  return Employee;
}; 