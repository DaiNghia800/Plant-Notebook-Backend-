'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class PostLike extends Model {
    static associate(models) {
      PostLike.belongsTo(models.Post, { foreignKey: 'postId', as: 'post' });
      PostLike.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
    }
  }

  PostLike.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    postId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    userId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  }, {
    sequelize,
    modelName: 'PostLike',
    tableName: 'PostLikes',
  });

  return PostLike;
};
