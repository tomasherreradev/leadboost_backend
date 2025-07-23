'use strict';
module.exports = (sequelize, DataTypes) => {
  const Message = sequelize.define('Message', {
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    provider: {
      type: DataTypes.STRING,
      allowNull: false
    },
    provider_message_id: DataTypes.STRING,
    sender_id: {
      type: DataTypes.STRING,
      allowNull: false
    },
    sender_name: DataTypes.STRING,
    recipient_id: DataTypes.STRING,
    recipient_name: DataTypes.STRING,
    content: DataTypes.TEXT,
    type: DataTypes.STRING,
    timestamp: {
      type: DataTypes.DATE,
      allowNull: false
    },
    extra_data: DataTypes.JSON
  }, {
    tableName: 'Messages',
    underscored: true
  });

  Message.associate = function(models) {
    Message.belongsTo(models.User, { foreignKey: 'user_id' });
  };

  return Message;
};