const express = require("express");
const app = express();
const http = require("http");
const fs = require("fs");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const mongoose = require("mongoose");
const helmet = require("helmet");
const path = require("path");
const appConfig = require("./config/appConfig");
const logger = require("./app/libs/loggerLib");
const appErrorHandler = require("./app/middlewares/appErrorHandler");
const routeLogger = require("./app/middlewares/routeLogger");
const modelsPath = "./app/models";
const routesPath = "./app/routes";

/**
 * Middlewares
 */
app.use(morgan("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(helmet());
app.use(routeLogger.logIp);
app.use(appErrorHandler.globalErrorHandler);
app.use(express.static(path.join(__dirname, "../frontend/dist/frontend")));

app.all("*", function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE");
  next();
});

/**
 * Boostrap models
 */
fs.readdirSync(modelsPath).forEach(file => {
  if (~file.indexOf(".js")) require(modelsPath + "/" + file);
});

/**Boostrap routes */
fs.readdirSync(routesPath).forEach(file => {
  if (~file.indexOf(".js")) {
    require(routesPath + "/" + file).setRouter(app);
  }
});
app.use(appErrorHandler.globalNotFoundHandler);

/**
 * Create HTTP server.
 */

const server = http.createServer(app);
server.listen(appConfig.port);
server.on("error", onError);
server.on("listening", onListening);

//socket io handler
const socketLib = require("./app/libs/socketLib");
const socketServer = socketLib.setServer(server);

//Events listener for HTTP server "Error" event.
function onError(error) {
  if (error.syscall !== "listen") {
    logger.error(error.code + " not equal listen", "serverOnErrorHandler", 10);
    throw error;
  }
  switch (error.code) {
    case "EACCES":
      logger.error(
        error.code + ":elavated privileges required",
        "serverOnErrorHandler",
        10
      );
      process.exit(1);
      break;
    case "EADDRINUSE":
      logger.error(
        error.code + ":port is already in use.",
        "serverOnErrorHandler",
        10
      );
      process.exit(1);
      break;
    default:
      logger.error(
        error.code + ":some unknown error occured",
        "serverOnErrorHandler",
        10
      );
      throw error;
  }
}

/**
 * Event listener for HTTP server.
 */

function onListening() {
  var addr = server.address();
  var bind = typeof addr === "string" ? "pipe " + addr : "port " + addr.port;
  "Listening on " + bind;
  logger.info(
    "server listening on port" + addr.port,
    "serverOnListeningHandler",
    10
  );
  let db = mongoose.connect(appConfig.dbUri, { useNewUrlParser: true });
}

process.on("unhandledRejection", (reason, p) => {
  console.log("Unhandled Rejection at: Promise", p, "reason:", reason);
});

/**
 * Database connection events.
 */
mongoose.connection.on("error", function(err) {
  logger.error(err, "mongoose connection on error handler", 10);
});

mongoose.connection.on("open", function(err) {
  if (err) {
    logger.error(err, "mongoose connection open handler", 10);
  } else {
    logger.info(
      "database connection open",
      "database connection open handler",
      10
    );
  }
});

module.exports = app;
