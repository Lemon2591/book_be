const { sequelize } = require("../connection");
const BaseModel = require("../config/BaseModel");
const { DataTypes } = require("sequelize");

/**
 * Define Genre Model
 */
class Genres extends BaseModel {
  static association() {
    const Stories = require("./Stories");
    const StoryGenres = require("./StoryGenres");

    // Một thể loại có nhiều truyện (N-N)
    this.belongsToMany(Stories, {
      through: StoryGenres,
      foreignKey: "genre_id",
      otherKey: "story_id",
      as: "stories",
    });
  }
}

const attributes = {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  slug: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
};

const options = {
  tableName: "genres",
};

Genres.init(attributes, { ...options, sequelize });

module.exports = Genres;
