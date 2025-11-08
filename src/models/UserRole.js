const { sequelize } = require("../connection");
const BaseModel = require("../config/BaseModel");
const { DataTypes } = require("sequelize");

/**
 * Define Level Model
 *
 * @export
 * @class Level
 * @extends {BaseModel}
 */
class UserRole extends BaseModel {
  static association() {
    const Users = require("./Users");
    const Role = require("./Role");

    this.belongsTo(Users, {
      foreignKey: "user_id",
      targetKey: "id",
      as: "users",
    });

    this.belongsTo(Role, {
      foreignKey: "role_id",
      targetKey: "id",
      as: "role",
    });
  }
}
/**
 * Attributes model
 */

const attributes = {
  id: {
    type: DataTypes.INTEGER(10).UNSIGNED,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },

  user_id: {
    type: DataTypes.INTEGER(10).UNSIGNED,
    allowNull: false,
  },

  role_id: {
    type: DataTypes.INTEGER(10).UNSIGNED,
    allowNull: false,
  },
};

/**
 * Options model
 */
const options = {
  tableName: "user_role",
};

/**
 * Init Model
 */
UserRole.init(attributes, { ...options, sequelize });

module.exports = UserRole;
