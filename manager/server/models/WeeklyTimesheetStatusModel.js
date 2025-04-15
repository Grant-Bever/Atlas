const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class WeeklyTimesheetStatus extends Model {
    static associate(models) {
      // A status record belongs to one Employee
      WeeklyTimesheetStatus.belongsTo(models.Employee, {
        foreignKey: 'employee_id',
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
    employee_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'employees', // table name
        key: 'id'
      }
    },
    weekStartDate: {
      type: DataTypes.DATEONLY, // Store only the date (YYYY-MM-DD)
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