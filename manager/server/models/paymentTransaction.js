module.exports = (sequelize, DataTypes) => {
  const PaymentTransaction = sequelize.define('PaymentTransaction', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    stripePaymentId: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    currency: {
      type: DataTypes.STRING(3),
      allowNull: false,
      defaultValue: 'usd'
    },
    status: {
      type: DataTypes.ENUM('pending', 'completed', 'failed', 'refunded'),
      allowNull: false,
      defaultValue: 'pending'
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true
    },
    metadata: {
      type: DataTypes.JSON,
      allowNull: true
    }
  }, {
    tableName: 'payment_transactions',
    timestamps: true
  });

  PaymentTransaction.associate = (models) => {
    // Associate with employee if applicable
    if (models.Employee) {
      PaymentTransaction.belongsTo(models.Employee, {
        foreignKey: 'employeeId',
        as: 'employee'
      });
    }
    
    // Associate with customer if applicable
    if (models.Customer) {
      PaymentTransaction.belongsTo(models.Customer, {
        foreignKey: 'customerId', 
        as: 'customer'
      });
    }
  };

  return PaymentTransaction;
}; 