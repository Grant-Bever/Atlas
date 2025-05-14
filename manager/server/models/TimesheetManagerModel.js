const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  const Timesheet = sequelize.define('Timesheet', {
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
        model: 'managers',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL' // Matches schema definition
    }
  }, {
    modelName: 'Timesheet',
    tableName: 'timesheets',
    timestamps: false
  });

  Timesheet.associate = (models) => {
    Timesheet.belongsTo(models.Manager, { foreignKey: 'manager_id', as: 'manager' });
    Timesheet.hasMany(models.Workday, { foreignKey: 'timesheet_id', as: 'workdays' });
  };

  return Timesheet;
}; 
