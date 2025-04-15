const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Customer extends Model {
    static associate(models) {
      Customer.hasMany(models.Invoice, { foreignKey: 'customer_id', as: 'invoices' });
    }
  }
  Customer.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    email: {
      type: DataTypes.STRING(255),
      unique: true,
      validate: {
        isEmail: true
      }
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    password: {
      type: DataTypes.STRING(255)
      // Consider adding hooks for password hashing (bcrypt) before saving
    }
  }, {
    sequelize,
    modelName: 'Customer',
    tableName: 'customers',
    timestamps: false
  });
  return Customer;
}; 