'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('social_accounts', 'provider_user_id', {
      type: Sequelize.STRING,
      allowNull: true,
      after: 'provider'
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('social_accounts', 'provider_user_id');
  }
};
