const express = require("express");
let AuthAPI = require("./server/auth");
let ProdutoAPI = require("./server/produtos");

function initialize() {
  const api = express();

  api.use("/auth", AuthAPI());
  api.use("/products", ProdutoAPI());

  return api;
}

module.exports = {
  initialize: initialize,
};
