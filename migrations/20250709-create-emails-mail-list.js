"use strict";
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("emails_mail_list", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      mail_list_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "mail_lists", key: "id" },
        onDelete: "CASCADE",
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("emails_mail_list");
  },
};
