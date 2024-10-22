
require("rootpath")();
const express = require("express");
const cors = require("cors");
// const jwt = require("./app/helpers/jwt");
// const errorHandler = require("./app/helpers/error-handler");
// const swaggerJsdoc = require("swagger-jsdoc");
// const swaggerUi = require("swagger-ui-express");
const config = require("./app/config/index");
const package = require("package.json");
const app = express();
const https = require("https");
const fs = require("fs");
// const setupSocket1 = require("./app/helpers/socket-io");
// const socketIo = require("socket.io");

const mongoose = require('mongoose');

// MongoDB connection
// mongoose.connect(process.env.MONGODB_URI || config.connectionString, {
// //   useNewUrlParser: true,
// //   useUnifiedTopology: true,
// })
mongoose.connect(config.connectionString)
.then(() => {
  console.log('Connected to MongoDB');
})
.catch(err => {
  console.error('MongoDB connection error:', err);
});
mongoose.Promise = global.Promise;




const ENV = config.app_env;
console.log("env=" + config.app_env);
var SWAG_URL = ENV == "local" ? config.local_url : config.dev_url;
var PORT = ENV == "local" ? config.local_port : config.dev_port;

app.get("/", function (req, res) {
  res.redirect("/documentation");
});

// app.use(jwt());

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true }));

app.use(cors());

global.__basedir = __dirname;

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  next();
});
// Require routes
// app.use("/front", require("./app/controllers/front.controller"));
// app.use("/community", require("./app/controllers/community.controller"));
app.use("/admin", require("./app/controllers/admin.controller"));
app.use("/user", require("./app/controllers/user.controller.js"));
// app.use("/seller", require("./app/controllers/seller.controller"));
app.use(
  "/" + config.uploadDir,
  express.static(__dirname + "/" + config.uploadDir)
);
// app.use(errorHandler);


// var certOptions = {
//   key: fs.readFileSync(config.ssl_key, "utf8"),
//   cert: fs.readFileSync(config.ssl_cert, "utf8"),
// };

// serve the API with HTTPS
// const httpsServer = https.createServer(certOptions, app);

// httpsServer.listen(PORT, () => {
//   console.log("HTTPS Server running on port " + PORT);
//   //log.Info(`Server Running at ${PORT} on ${process.env.NODE_ENV}...`)
// });

//const httpServer = app.listen(PORT, () => {
//    console.log("HTTP Server running on port " + PORT);
    //log.Info(`Server Running at ${PORT} on ${process.env.NODE_ENV}...`)
//  });

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`);
  });


