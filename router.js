const express = require("express");
let AuthAPI = require("./server/auth");
let ProdutoAPI = require("./server/produtos");
let SalesAPI = require("./server/encomendas");

function initialize() {
  const api = express();

  api.use("/auth", AuthAPI());
  api.use("/products", ProdutoAPI());
  api.use("/sales", SalesAPI());
  
  return api;
}

module.exports = {
  initialize: initialize,
};
