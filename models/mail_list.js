"use strict";
module.exports = (sequelize, DataTypes) => {
  const MailList = sequelize.define(
    "MailList",
    {
      nombre: DataTypes.STRING,
      observacion: DataTypes.TEXT,
      user_id: DataTypes.INTEGER,
    },
    {
      tableName: "mail_lists",
    }
  );

  MailList.associate = function (models) {
    MailList.belongsTo(models.User, { foreignKey: "user_id" });
    MailList.hasMany(models.EmailsMailList, {
      foreignKey: "mail_list_id",
      as: "emails",
    });
  };

  return MailList;
};
