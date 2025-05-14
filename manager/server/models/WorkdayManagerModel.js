module.exports = (sequelize, DataTypes) => {
  const Workday = sequelize.define('Workday', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    clock_in: {
      type: DataTypes.DATE, // Corresponds to TIMESTAMP WITH TIME ZONE
      allowNull: false
    },
    clock_out: {
      type: DataTypes.DATE
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    daily_pay: {
      type: DataTypes.DECIMAL(10, 2)
    },
    employee_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'employees',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE' // Matches schema definition
    },
    timesheet_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'timesheets',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL' // Matches schema definition
    }
  }, {
    modelName: 'Workday',
    tableName: 'workdays',
    timestamps: false
  });

  Workday.associate = (models) => {
    Workday.belongsTo(models.Employee, { foreignKey: 'employee_id', as: 'employee' });
    Workday.belongsTo(models.Timesheet, { foreignKey: 'timesheet_id', as: 'timesheet' });
  };

  return Workday;
}; 