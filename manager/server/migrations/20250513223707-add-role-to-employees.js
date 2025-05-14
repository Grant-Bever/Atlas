'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('employees', 'role', { // Table name is 'employees'
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'employee' // Default for new rows or existing rows if not updated
    });

    // Optional: If you want to immediately update existing users you know are managers,
    // you can add SQL here. However, it's often safer to do this manually via a SQL client
    // after the migration has run, especially if you need to be selective.
    // Example (use with caution and adapt to your needs):
    // await queryInterface.sequelize.query(
    //   `UPDATE "employees" SET "role" = 'manager' WHERE "email" = 'manager1@example.com';`
    // );
    // await queryInterface.sequelize.query(
    //   `UPDATE "employees" SET "role" = 'manager' WHERE "email" = 'manager2@example.com';`
    // );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('employees', 'role');
  }
};