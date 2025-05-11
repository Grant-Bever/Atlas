const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class WeeklyTimesheetStatus extends Model {
    static associate(models) {
      // A status record belongs to one Employee
      WeeklyTimesheetStatus.belongsTo(models.Employee, {
        foreignKey: 'employeeId',
        as: 'employee'
      });
    }
  }
  WeeklyTimesheetStatus.init({
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
    },
    // Optional: Add fields like approver_id, approval_timestamp etc.
  }, {
    sequelize,
    modelName: 'WeeklyTimesheetStatus',
    tableName: 'weekly_timesheet_statuses',
    timestamps: true, // Use Sequelize timestamps (createdAt, updatedAt)
    underscored: true, // Use snake_case for automatic fields
    // Add a unique constraint to ensure only one status per employee per week start date
    indexes: [
      {
        unique: true,
        fields: ['employee_id', 'week_start_date']
      }
    ]
  });
  return WeeklyTimesheetStatus;
}; 