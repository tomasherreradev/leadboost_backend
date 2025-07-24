"use strict";
module.exports = (sequelize, DataTypes) => {
  const ContactList = sequelize.define(
    "ContactList",
    {
      nombre: DataTypes.STRING,
      observacion: DataTypes.TEXT,
      user_id: DataTypes.INTEGER,
    },
    {
      tableName: "contact_lists",
    }
  );

  ContactList.associate = function (models) {
    ContactList.belongsTo(models.User, { foreignKey: "user_id" });
    ContactList.hasMany(models.NumbersContactList, {
      foreignKey: "contact_list_id",
      as: "numbers",
    });
  };

  return ContactList;
};
