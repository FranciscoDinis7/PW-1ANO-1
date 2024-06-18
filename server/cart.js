const express = require("express");
const scopes = require("../data/users/scopes");
const {
  getCart,
  AddCarrinho,
  deleteCart,
  updateCart,
} = require("../data/Controllers/Cartontroller");
const authorize = require("../midleware/autentication");
const verifyToken = require("../midleware/verfytoken");


function cartRouter() {
  let router = express();

  // List All Cart
  router.get("/items", verifyToken, getCart);

  //Add to Cart
  router.post("/add/:productID", verifyToken, AddCarrinho);

  //Delete Cart
  router.delete("/delete/:productID", verifyToken, deleteCart);

  //Update Cart
  router.put("/update/:productID", verifyToken, updateCart);

  return router;
}

module.exports = cartRouter;