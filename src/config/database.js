require("dotenv").config();
module.exports = {
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || "3306",
  username: process.env.DB_USERNAME || "root",
  password: process.env.DB_PASSWORD || "root010925",
  database: process.env.DB_DATABASE || "book_db",
  dialect: "mysql",
  logging: false,
  // timezone : '+07:00',
  pool: { max: 100, min: 0, idle: 1000 },
  // query: { raw: true },
};
