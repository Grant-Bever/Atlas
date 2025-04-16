module.exports = (sequelize, DataTypes) => {
  const Timesheet = sequelize.define('Timesheet', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    employeeId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Employees',
        key: 'id'
      }
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    hoursWorked: {
      type: DataTypes.DECIMAL(4, 2),
      allowNull: false,
      validate: {
        min: 0,
        max: 24
      }
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('draft', 'submitted', 'approved', 'denied', 'paid'),
      defaultValue: 'draft'
    },
    managerFeedback: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    submissionCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    reviewedBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Employees',
        key: 'id'
      }
    },
    reviewedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    payPeriodId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'PayPeriods',
        key: 'id'
      }
    }
  });

  Timesheet.associate = (models) => {
    Timesheet.belongsTo(models.Employee, {
      foreignKey: 'employeeId',
      as: 'employee'
    });
    Timesheet.belongsTo(models.PayPeriod, {
      foreignKey: 'payPeriodId',
      as: 'payPeriod'
    });
  };

  return Timesheet;
}; 