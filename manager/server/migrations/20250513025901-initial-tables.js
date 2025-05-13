'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */

    // Tables without dependencies on other models in this set first

    // 1. Managers (from ManagerModel.js)
    await queryInterface.createTable('managers', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      email: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true
      },
      encrypted_phone_number: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      password_hash: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    // 2. Employees (from EmployeeManagerModel.js)
    await queryInterface.createTable('employees', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      email: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true
      },
      encrypted_phone_number: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      name: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      password_hash: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      hourly_rate: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
        defaultValue: 15.00
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      fired_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    // 3. Customers (from CustomerManagerModel.js)
    await queryInterface.createTable('customers', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: { 
        type: Sequelize.STRING(255),
        allowNull: false
      },
      email: {
        type: Sequelize.STRING(255),
        allowNull: false, 
        unique: true
      },
      encrypted_phone_number: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      password_hash: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    // 4. PayPeriods (from payPeriod.js)
    await queryInterface.createTable('PayPeriods', { // Note: Model didn't specify tableName, using model name
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      startDate: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      endDate: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      status: {
        type: Sequelize.ENUM('active', 'closed', 'paid'),
        defaultValue: 'active'
      },
      paymentDate: {
        type: Sequelize.DATEONLY,
        allowNull: true
      },
      // Assuming timestamps are managed by Sequelize if not specified here
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    // 5. Inventory (from InventoryManagerModel.js)
    await queryInterface.createTable('inventory', { // uses singular table name from model
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      price_per_pound: {
        type: Sequelize.DECIMAL(10, 2)
      },
      name: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      category: {
        type: Sequelize.STRING(100)
      },
      quantity: {
        type: Sequelize.DECIMAL(10, 2)
      },
      price_per_box: {
        type: Sequelize.DECIMAL(10, 2)
      },
      manager_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'managers',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL' 
      }
      // timestamps: false in model, so not adding createdAt/updatedAt here
    });

    // 6. Invoices (from OrderManagerModel.js)
    await queryInterface.createTable('invoices', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      total: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false
      },
      date: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      checked_out: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      paid: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      completed: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      customer_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'customers',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE' 
      }
      // timestamps: false in model
    });

    // 7. Timesheets (from timesheet.js)
    await queryInterface.createTable('Timesheets', { // Note: Model didn't specify tableName, using model name
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      employeeId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'employees',
          key: 'id'
        }
      },
      date: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      hoursWorked: {
        type: Sequelize.DECIMAL(6, 3),
        allowNull: false
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      status: {
        type: Sequelize.ENUM('draft', 'submitted', 'approved', 'denied', 'paid'),
        defaultValue: 'draft'
      },
      managerFeedback: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      submissionCount: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      reviewedBy: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'employees', // Note: References employees table
          key: 'id'
        }
      },
      reviewedAt: {
        type: Sequelize.DATE,
        allowNull: true
      },
      payPeriodId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'PayPeriods',
          key: 'id'
        }
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    // Tables depending on multiple others last

    // 8. Workdays (from WorkdayManagerModel.js)
    await queryInterface.createTable('workdays', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      clock_in: {
        type: Sequelize.DATE, 
        allowNull: false
      },
      clock_out: {
        type: Sequelize.DATE
      },
      date: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      daily_pay: {
        type: Sequelize.DECIMAL(10, 2)
      },
      employee_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'employees',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      timesheet_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Timesheets',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      }
      // timestamps: false in model
    });

    // 9. Invoice_Items (from InvoiceItemManagerModel.js)
    await queryInterface.createTable('invoice_items', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      quantity: {
        type: Sequelize.DECIMAL(10, 2)
      },
      notes: {
        type: Sequelize.TEXT
      },
      amount: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false
      },
      price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      weight: {
        type: Sequelize.DECIMAL(10, 2)
      },
      item: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      invoice_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'invoices',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE' 
      }
      // timestamps: false in model
    });

    // 10. Timesheet Entries (from TimesheetEntryModel.js)
    await queryInterface.createTable('timesheet_entries', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      employee_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'employees',
          key: 'id'
        }
      },
      timesheet_id: { // Sequelize model uses timesheetId, maps to timesheet_id due to underscored: true
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Timesheets',
          key: 'id'
        }
      },
      clock_in_time: { // Sequelize model uses clockInTime
        type: Sequelize.DATE,
        allowNull: false
      },
      clock_out_time: { // Sequelize model uses clockOutTime
        type: Sequelize.DATE,
        allowNull: true
      },
      created_at: { // Automatically added by underscored: true
        allowNull: false,
        type: Sequelize.DATE
      },
      updated_at: { // Automatically added by underscored: true
        allowNull: false,
        type: Sequelize.DATE
      }
    });
    
    // Add other tables here if needed (e.g., WeeklyTimesheetStatus, clockEvent, etc.) in correct dependency order

  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */

    // Drop tables in reverse order of creation to respect foreign keys
    await queryInterface.dropTable('timesheet_entries');
    await queryInterface.dropTable('invoice_items');
    await queryInterface.dropTable('workdays');
    await queryInterface.dropTable('Timesheets');
    await queryInterface.dropTable('invoices');
    await queryInterface.dropTable('inventory');
    await queryInterface.dropTable('PayPeriods');
    await queryInterface.dropTable('customers');
    await queryInterface.dropTable('employees');
    await queryInterface.dropTable('managers');
  }
};
