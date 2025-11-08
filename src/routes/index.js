const { Router } = require("express");
const ApiApp = require("./api/apiApp");

const routerApp = new Router();

routerApp.use("/api", ApiApp);

module.exports = routerApp;
