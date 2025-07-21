'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  User.init({
    email: DataTypes.STRING,
    password_hash: DataTypes.STRING,
    reset_token: DataTypes.STRING,
    reset_token_expires: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'User',
  });


  User.associate = function (models) {
    User.hasMany(models.SocialAccount, { foreignKey: 'user_id' });
    User.hasMany(models.Post, { foreignKey: 'user_id' });
  };
  

  return User;
};