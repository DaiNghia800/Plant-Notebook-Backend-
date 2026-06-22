'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Post extends Model {
    static associate(models) {
      Post.belongsTo(models.User, { foreignKey: 'userId', as: 'author' });
      Post.hasMany(models.Comment, { foreignKey: 'postId', as: 'comments', onDelete: 'CASCADE' });
      Post.hasMany(models.PostLike, { foreignKey: 'postId', as: 'likes', onDelete: 'CASCADE' });
    }
  }

  Post.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    userId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    imageUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  }, {
    sequelize,
    modelName: 'Post',
    tableName: 'Posts',
  });

  return Post;
};
