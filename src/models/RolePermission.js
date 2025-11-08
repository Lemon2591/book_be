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
class RolePermission extends BaseModel {
  static association() {
    const Permission = require("./Permission");
    const Role = require("./Role");
    // Mối quan hệ với Role
    this.belongsTo(Role, {
      foreignKey: "role_id",
      targetKey: "id",
      as: "role",
    });

    // Mối quan hệ với Permission
    this.belongsTo(Permission, {
      foreignKey: "permission_id",
      targetKey: "id",
      as: "permission",
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
  role_id: {
    type: DataTypes.INTEGER(10).UNSIGNED,
    allowNull: false,
  },
  permission_id: {
    type: DataTypes.INTEGER(10).UNSIGNED,
    allowNull: false,
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
  tableName: "role_permission",
};

/**
 * Init Model
 */
RolePermission.init(attributes, { ...options, sequelize });

module.exports = RolePermission;
