const { sequelize } = require("../connection");
const BaseModel = require("../config/BaseModel");
const { DataTypes } = require("sequelize");

/**
 * Define Chapter Model
 *
 * @export
 * @class Chapters
 * @extends {BaseModel}
 */
class Chapters extends BaseModel {
  static association() {
    const Stories = require("./Stories");

    this.belongsTo(Stories, {
      foreignKey: "story_id",
      targetKey: "id",
      as: "story",
    });
  }
}

/**
 * Attributes model
 */
const attributes = {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    primaryKey: true,
    autoIncrement: true,
  },
  story_id: {
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
  content: {
    type: DataTypes.TEXT("long"),
    allowNull: true,
  },
  order_number: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: true,
    defaultValue: 0,
  },
  status: {
    type: DataTypes.INTEGER(10).UNSIGNED,
    allowNull: false,
    defaultValue: 1,
  },
};

/**
 * Options model
 */
const options = {
  tableName: "chapters",
};

/**
 * Init Model
 */
Chapters.init(attributes, { ...options, sequelize });

module.exports = Chapters;
