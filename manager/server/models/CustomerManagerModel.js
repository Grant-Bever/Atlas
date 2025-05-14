const bcrypt = require('bcrypt');

module.exports = (sequelize, DataTypes) => {
  const Customer = sequelize.define('Customer', {
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
      allowNull: true,
      validate: {
        isEmail: true
      }
    },
    encrypted_phone_number: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    password_hash: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW
    }
  }, {
    modelName: 'Customer',
    tableName: 'customers',
    timestamps: true,
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

  Customer.prototype.validatePassword = async function(password) {
    return bcrypt.compare(password, this.password_hash);
  };

  Customer.associate = (models) => {
    Customer.hasMany(models.Invoice, { foreignKey: 'customer_id', as: 'invoices' });
  };

  return Customer;
}; 