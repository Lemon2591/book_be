const { sequelize } = require("../connection");
const BaseModel = require("../config/BaseModel");
const { DataTypes } = require("sequelize");

/**
 * Define StoryGenres (Pivot Table)
 */
class StoryGenres extends BaseModel {}

const attributes = {
  story_id: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
    primaryKey: true,
  },
  genre_id: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
    primaryKey: true,
  },
};

const options = {
  tableName: "story_genres",
};

StoryGenres.init(attributes, { ...options, sequelize });

module.exports = StoryGenres;
