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
class LoginStatus extends BaseModel {
  static association() {
    const Users = require("./Users");
    this.belongsTo(Users, {
      foreignKey: "user_id",
      targetKey: "id",
      as: "Users",
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
  login_time: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  ip_login: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
};

/**
 * Options model
 */
const options = {
  tableName: "login_status",
};

/**
 * Init Model
 */
LoginStatus.init(attributes, { ...options, sequelize });

module.exports = LoginStatus;
