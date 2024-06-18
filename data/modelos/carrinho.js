const mongoose = require("mongoose");

const cartItemSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  quantity: {
    type: Number,
    default: 0,
    validate: {
      validator: Number.isInteger,
      message: "A quantidade deve ser um número inteiro.",
    },
  },
  totalPrice: {
    type: Number,
    default: 0,
    min: [0, "Preço deve ser positivo!"],
  },
});

const shoppingCartSchema = new mongoose.Schema({
  items: [cartItemSchema],
  total: {
    type: Number,
    default: 0,
  },
});

const ShoppingCart = mongoose.model("ShoppingCart", shoppingCartSchema);
const CartItem = mongoose.model("CartItem", cartItemSchema);

module.exports = { ShoppingCart, CartItem, shoppingCartSchema };