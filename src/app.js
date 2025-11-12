var express = require("express");
var path = require("path");
var logger = require("morgan");
const omitEmpty = require("omit-empty");
const compression = require("compression");
const cors = require("cors");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const app = express();
const routers = require("./routes");

// Set up Multer storage and configure the destination folder
// cors middleware

app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:5525",
      "https://truyen247.site",
    ],
    credentials: true,
  })
);

// remove Empty middleware
const removeEmptyProperties = () => {
  return function (req, res, next) {
    req.body = omitEmpty(req.body);
    req.params = omitEmpty(req.params);
    req.query = omitEmpty(req.query);
    next();
  };
};

app.use(cookieParser(process.env.COOKIE_KEY));

app.use(removeEmptyProperties());

// set compression middleware
app.use(compression());
// set body Parser middleware
app.use(bodyParser.json());
app.use(bodyParser.raw());
app.use(
  bodyParser.urlencoded({
    extended: false,
  })
);

//
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//set image storage
app.use(express.static(path.join(__dirname, "../static")));
app.use(routers);

// app.use(routers);

module.exports = app;
