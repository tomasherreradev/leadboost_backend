'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('post_targets', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      post_id: {
        type: Sequelize.INTEGER,
        references: { model: 'posts', key: 'id' },
        onDelete: 'CASCADE'
      },
      social_account_id: {
        type: Sequelize.INTEGER,
        references: { model: 'social_accounts', key: 'id' },
        onDelete: 'CASCADE'
      },
      provider: Sequelize.STRING, // redundancia útil
      remote_post_id: Sequelize.STRING,
      status: Sequelize.STRING, // published, failed, etc.
      format: Sequelize.STRING, // post, story, tweet, etc.
      extra_data: Sequelize.JSON,
      created_at: Sequelize.DATE,
      updated_at: Sequelize.DATE
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('post_targets');
  }
};

