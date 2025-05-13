'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('employees', 'manager_id', {
      type: Sequelize.INTEGER,
      allowNull: true, // Set to false if an employee MUST have a manager
      references: {
        model: 'managers', // This is the table name for your Manager model
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL', // Or 'RESTRICT' or 'CASCADE' based on your data integrity requirements
                           // 'SET NULL': If a manager is deleted, the employee's manager_id becomes NULL.
                           // 'RESTRICT': Prevents a manager from being deleted if they have associated employees.
                           // 'CASCADE': If a manager is deleted, all their associated employees are also deleted (use with caution).
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('employees', 'manager_id');
  }
};