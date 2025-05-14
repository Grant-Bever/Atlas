'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('clock_events', { // Table name matches model
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      employeeId: { // Column name for the foreign key
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'employees', // Name of the referenced table (employees)
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE', // If an employee is deleted, their clock events are also deleted. Adjust if needed.
      },
      eventType: {
        type: Sequelize.ENUM('CLOCK_IN', 'CLOCK_OUT'),
        allowNull: false
      },
      timestamp: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
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
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('clock_events');
  }
};
