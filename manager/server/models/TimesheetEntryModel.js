module.exports = (sequelize, DataTypes) => {
  const TimesheetEntry = sequelize.define('TimesheetEntry', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    employee_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'employees',
        key: 'id'
      }
    },
    timesheetId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'timesheets',
        key: 'id'
      }
    },
    clockInTime: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'clock_in_time'
    },
    clockOutTime: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'clock_out_time'
    }
  }, {
    modelName: 'TimesheetEntry',
    tableName: 'timesheet_entries',
    timestamps: true,
    underscored: true
  });

  TimesheetEntry.associate = (models) => {
    TimesheetEntry.belongsTo(models.Employee, {
      foreignKey: 'employee_id',
      as: 'employee'
    });
    TimesheetEntry.belongsTo(models.Timesheet, {
      foreignKey: 'timesheetId',
      as: 'timesheet'
    });
  };

  return TimesheetEntry;
}; 