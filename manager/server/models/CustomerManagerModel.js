const { Model } = require('sequelize');
const bcrypt = require('bcrypt'); // Make sure bcrypt is installed

module.exports = (sequelize, DataTypes) => {
  class Customer extends Model {
    static associate(models) {
      Customer.hasMany(models.Invoice, { foreignKey: 'customer_id', as: 'invoices' });
    }

    // Instance method to validate password
    async validatePassword(password) {
      return bcrypt.compare(password, this.password_hash);
    }
  }
  Customer.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    name: { // Assuming 'name' is sufficient
      type: DataTypes.STRING(255),
      allowNull: false
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false, // Made non-nullable
      unique: true,
      validate: {
        isEmail: true
      }
    },
    encrypted_phone_number: { // Renamed
      type: DataTypes.STRING(255),
      allowNull: true // Phone is optional
    },
    password_hash: { // Renamed
      type: DataTypes.STRING(255),
      allowNull: false // Reverted to NOT NULL
    }
  }, {
    sequelize,
    modelName: 'Customer',
    tableName: 'customers',
    timestamps: true, // Enabled timestamps
    hooks: {
      beforeCreate: async (customer) => {
        if (customer.password_hash) {
          const salt = await bcrypt.genSalt(10);
          customer.password_hash = await bcrypt.hash(customer.password_hash, salt);
        }
      },
      beforeUpdate: async (customer) => {
        if (customer.changed('password_hash') && customer.password_hash) {
          const salt = await bcrypt.genSalt(10);
          customer.password_hash = await bcrypt.hash(customer.password_hash, salt);
        }
      }
    }
  });
  return Customer;
}; 