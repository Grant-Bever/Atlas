const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Timesheet extends Model {
    static associate(models) {
      Timesheet.belongsTo(models.Manager, { foreignKey: 'manager_id', as: 'manager' });
      Timesheet.hasMany(models.Workday, { foreignKey: 'timesheet_id', as: 'workdays' });
    }
  }
  Timesheet.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    status: {
      type: DataTypes.STRING(50),
      validate: {
        isIn: [['pending', 'approved', 'rejected']] // Matches CHECK constraint
      }
    },
    start_date: {
      type: DataTypes.DATEONLY, // Use DATEONLY for DATE SQL type
      allowNull: false
    },
    end_date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    manager_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Managers', // Can be model name or model class
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL' // Matches schema definition
    }
  }, {
    sequelize,
    modelName: 'Timesheet',
    tableName: 'timesheets',
    timestamps: false
  });
  return Timesheet;
}; 