const http = require("http");
const express = require("express");
const config = require("./config");
var mongoose = require("mongoose");
const cors = require("cors");

const hostname = "127.0.0.1";
const port = 3001;
const router = require("./router");
const app = express();
app.use(cors())
app.use(router.initialize());



const server = http.Server(app);

mongoose
  .connect(config.db)
  .then(() => {
    console.log("Connection successful!");
  })
  .catch((err) => {
    console.error(err);
  });

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
