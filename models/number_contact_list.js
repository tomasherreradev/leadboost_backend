"use strict";
module.exports = (sequelize, DataTypes) => {
  const NumbersContactList = sequelize.define(
    "NumbersContactList",
    {
      number: DataTypes.STRING,
      contact_list_id: DataTypes.INTEGER,
    },
    {
      tableName: "numbers_contact_list",
    }
  );

  NumbersContactList.associate = function (models) {
    NumbersContactList.belongsTo(models.ContactList, { foreignKey: "contact_list_id" });
  };

  return NumbersContactList;
};
