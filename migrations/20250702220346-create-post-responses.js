'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('post_responses', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      post_target_id: {
        type: Sequelize.INTEGER,
        references: { model: 'post_targets', key: 'id' },
        onDelete: 'CASCADE'
      },
      remote_comment_id: Sequelize.STRING,
      author_name: Sequelize.STRING,
      message: Sequelize.TEXT,
      type: Sequelize.STRING, // comment, like, reply, etc.
      provider: Sequelize.STRING,
      created_at: Sequelize.DATE,
      updated_at: Sequelize.DATE
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('post_responses');
  }
};
