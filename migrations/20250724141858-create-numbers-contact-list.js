"use strict";
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("numbers_contact_list", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      number: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      contact_list_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "contact_lists", key: "id" },
        onDelete: "CASCADE",
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        field: "created_at",
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        field: "updated_at",
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("numbers_contact_list");
  },
};
