// leadbost/backend/src/models/PostTarget.js
'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class PostTarget extends Model {
    static associate(models) {
      PostTarget.belongsTo(models.Post, { foreignKey: 'post_id' });
      PostTarget.belongsTo(models.SocialAccount, { foreignKey: 'social_account_id' });
      PostTarget.hasMany(models.PostResponse, { foreignKey: 'post_target_id' });
    }
  }

  PostTarget.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      post_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'Posts',
          key: 'id',
        },
      },
      social_account_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'SocialAccounts',
          key: 'id',
        },
      },
      provider: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      remote_post_id: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      status: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      format: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      extra_data: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'created_at',
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'updated_at',
      },
    },
    {
      sequelize,
      modelName: 'PostTarget',
      tableName: 'post_targets', // Match database table name
      timestamps: true,
      underscored: true, // Use snake_case for all fields
    }
  );

  return PostTarget;
};