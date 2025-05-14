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
        model: 'employees',
        key: 'id'
      }
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    hoursWorked: {
      type: DataTypes.DECIMAL(6, 3),
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
        model: 'employees',
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
    },
    manager_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'managers',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    }
  }, {
    tableName: 'Timesheets',
    timestamps: true,
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
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
    if (models.Employee) {
        Timesheet.belongsTo(models.Employee, {
            foreignKey: 'reviewedBy',
            as: 'reviewer',
            constraints: false
        });
    }
    Timesheet.belongsTo(models.Manager, {
      foreignKey: 'manager_id',
      as: 'manager'
    });
  };

  return Timesheet;
}; 