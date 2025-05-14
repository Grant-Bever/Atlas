'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('Timesheets', 'manager_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'managers',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('Timesheets', 'manager_id');
  }
};
