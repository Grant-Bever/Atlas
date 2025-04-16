module.exports = (sequelize, DataTypes) => {
  const PayPeriod = sequelize.define('PayPeriod', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    startDate: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    endDate: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('active', 'closed', 'paid'),
      defaultValue: 'active'
    },
    paymentDate: {
      type: DataTypes.DATEONLY,
      allowNull: true
    }
  });

  PayPeriod.associate = (models) => {
    PayPeriod.hasMany(models.Timesheet, {
      foreignKey: 'payPeriodId',
      as: 'timesheets'
    });
  };

  return PayPeriod;
}; 