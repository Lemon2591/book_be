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
class Users extends BaseModel {
  static association() {
    const LoginStatus = require("./LoginStatus");
    const UserRole = require("./UserRole");

    this.hasOne(LoginStatus, {
      foreignKey: "user_id",
      targetKey: "id",
      as: "users",
    });

    this.hasOne(UserRole, {
      foreignKey: "user_id",
      targetKey: "id",
      as: "user_role",
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
  full_name: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },

  full_name: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },

  phone: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },

  otp: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },

  date_of_birth: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },

  is_delete: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },

  createdAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  updatedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
};

/**
 * Options model
 */
const options = {
  tableName: "users",
};

/**
 * Init Model
 */
Users.init(attributes, { ...options, sequelize });

module.exports = Users;
