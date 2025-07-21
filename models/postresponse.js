'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class PostResponse extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  PostResponse.init({
    post_target_id: DataTypes.INTEGER,
    remote_comment_id: DataTypes.STRING,
    author_name: DataTypes.STRING,
    message: DataTypes.TEXT,
    type: DataTypes.STRING,
    provider: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'PostResponse',
  });


  PostResponse.associate = function (models) {
    PostResponse.belongsTo(models.PostTarget, { foreignKey: 'post_target_id' });
  };
  

  return PostResponse;
};