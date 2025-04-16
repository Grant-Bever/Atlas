module.exports = (sequelize, DataTypes) => {
  const TimesheetNotification = sequelize.define('TimesheetNotification', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    employeeId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    timesheetId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    type: {
      type: DataTypes.ENUM('denial', 'approval', 'reminder'),
      allowNull: false
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    read: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  });

  TimesheetNotification.associate = (models) => {
    TimesheetNotification.belongsTo(models.Employee, {
      foreignKey: 'employeeId',
      as: 'employee'
    });
    TimesheetNotification.belongsTo(models.Timesheet, {
      foreignKey: 'timesheetId',
      as: 'timesheet'
    });
  };

  return TimesheetNotification;
}; 