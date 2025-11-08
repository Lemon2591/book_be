require("dotenv").config();
const http = require("http");
const cluster = require("cluster");
const { cpus, networkInterfaces } = require("os");
const process = require("process");
const app = require("./app.js");
const numCPUs = process.env.NODE_ENV === "production" ? cpus().length : 1;

const nets = networkInterfaces();

let results = {}; // Or just '{}', an empty object
for (const name of Object.keys(nets)) {
  for (const net of nets[name]) {
    const familyV4Value = typeof net.family === "string" ? "IPv4" : 4;
    if (net.family === familyV4Value && !net.internal) {
      results = net;
    }
  }
}

if (cluster.isPrimary) {
  console.log(`Primary ${process.pid} is running`);

  // Fork workers.
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on("exit", (worker, code, signal) => {
    console.log(`worker ${worker.process.pid} died`);
  });
} else {
  console.log(`worker ${process.pid} is running`);
  const HTTP_PORT = normalizePort(process.env.PORT || 8000);
  app.set("port", HTTP_PORT);
  const server = http.createServer(app);
  server.listen(HTTP_PORT, onListening);
}

async function onListening() {
  const addr = this.address();
  const bind = typeof addr === "string" ? "pipe " + addr : "port " + addr.port;
  console.log("Web server listening on " + bind);
  console.log(
    `Web server listening on address: ${results.address}:${addr.port}`
  );
}
function normalizePort(val) {
  const port = parseInt(val, 10);
  if (isNaN(port)) return val;
  if (port >= 0) return port;
  return false;
}
