const { sequelize } = require("../connection");
const BaseModel = require("../config/BaseModel");
const { DataTypes } = require("sequelize");

/**
 * Define Story Model
 */
class Stories extends BaseModel {
  static association() {
    const Users = require("./Users");
    const Chapters = require("./Chapters");
    const Genres = require("./Genres");
    const StoryGenres = require("./StoryGenres");

    // Một truyện thuộc về 1 user
    this.belongsTo(Users, {
      foreignKey: "user_id",
      targetKey: "id",
      as: "user",
    });

    // Một truyện có nhiều chương
    this.hasMany(Chapters, {
      foreignKey: "story_id",
      as: "chapters",
    });

    // Một truyện có nhiều thể loại (N-N)
    this.belongsToMany(Genres, {
      through: StoryGenres,
      foreignKey: "story_id",
      otherKey: "genre_id",
      as: "genres",
    });
  }
}

/**
 * Attributes
 */
const attributes = {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    primaryKey: true,
    autoIncrement: true,
  },
  user_id: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  slug: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  description: DataTypes.TEXT,
  author: DataTypes.STRING(255),
  cover_url: DataTypes.STRING(500),
  views: {
    type: DataTypes.INTEGER.UNSIGNED,
    defaultValue: 0,
  },
  status: {
    type: DataTypes.INTEGER(10).UNSIGNED,
    defaultValue: 1,
  },
};

/**
 * Options
 */
const options = {
  tableName: "stories",
};

Stories.init(attributes, { ...options, sequelize });

module.exports = Stories;
