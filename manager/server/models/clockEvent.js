module.exports = (sequelize, DataTypes) => {
  const ClockEvent = sequelize.define('ClockEvent', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    employeeId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    eventType: {
      type: DataTypes.ENUM('CLOCK_IN', 'CLOCK_OUT'),
      allowNull: false
    },
    timestamp: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  });

  ClockEvent.associate = (models) => {
    ClockEvent.belongsTo(models.Employee, {
      foreignKey: 'employeeId',
      as: 'employee'
    });
  };

  return ClockEvent;
}; 