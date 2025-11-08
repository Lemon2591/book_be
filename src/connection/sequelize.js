const database = require("../config/database");
const Sequelize = require("sequelize");

module.exports = {
  sequelize: new Sequelize(database),
};
