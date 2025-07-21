"use strict";
module.exports = (sequelize, DataTypes) => {
  const EmailsMailList = sequelize.define(
    "EmailsMailList",
    {
      email: DataTypes.STRING,
      mail_list_id: DataTypes.INTEGER,
    },
    {
      tableName: "emails_mail_list",
    }
  );

  EmailsMailList.associate = function (models) {
    EmailsMailList.belongsTo(models.MailList, { foreignKey: "mail_list_id" });
  };

  return EmailsMailList;
};
