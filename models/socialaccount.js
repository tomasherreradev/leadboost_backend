'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class SocialAccount extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  SocialAccount.init({
    user_id: DataTypes.INTEGER,
    provider: DataTypes.STRING,
    provider_user_id: DataTypes.STRING,
    access_token: DataTypes.TEXT,
    refresh_token: DataTypes.TEXT,
    expires_at: DataTypes.DATE,
    createdAt: {
      type: DataTypes.DATE,
      field: 'created_at',
    },
    updatedAt: {
      type: DataTypes.DATE,
      field: 'updated_at',
    },
  }, {
    sequelize,
    modelName: 'SocialAccount',
    tableName: 'social_accounts',
  });

  SocialAccount.associate = function (models) {
    SocialAccount.belongsTo(models.User, { foreignKey: 'user_id' });
    SocialAccount.hasMany(models.PostTarget, { foreignKey: 'social_account_id' });
  };
  
  return SocialAccount;
};