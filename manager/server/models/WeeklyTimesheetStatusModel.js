module.exports = (sequelize, DataTypes) => {
  const WeeklyTimesheetStatus = sequelize.define('WeeklyTimesheetStatus', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    employeeId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'employee_id',
      references: {
        model: 'employees',
        key: 'id'
      }
    },
    weekStartDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      field: 'week_start_date'
    },
    status: {
      type: DataTypes.ENUM('Pending', 'Approved', 'Denied'),
      allowNull: false,
      defaultValue: 'Pending'
    }
  }, {
    modelName: 'WeeklyTimesheetStatus',
    tableName: 'weekly_timesheet_statuses',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ['employee_id', 'week_start_date']
      }
    ]
  });

  WeeklyTimesheetStatus.associate = (models) => {
    WeeklyTimesheetStatus.belongsTo(models.Employee, {
      foreignKey: 'employeeId',
      as: 'employee'
    });
  };

  return WeeklyTimesheetStatus;
}; 