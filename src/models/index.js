const { sequelize } = require("../connection");
const Users = require("./Users");
const LoginStatus = require("./LoginStatus");
const UserRole = require("./UserRole");
const Role = require("./Role");
const Permission = require("./Permission");
const RolePermission = require("./RolePermission");
const Stories = require("./Stories");
const Chapters = require("./Chapters");
const Genres = require("./Genres");
const StoryGenres = require("./StoryGenres");

for (const m in sequelize.models) {
  sequelize.models[m].sync();
}

// Init association
for (const m in sequelize.models) {
  sequelize.models[m].association();
}

module.exports = {
  Users,
  LoginStatus,
  UserRole,
  Role,
  Permission,
  RolePermission,
  Stories,
  Chapters,
  Genres,
  StoryGenres,
};
