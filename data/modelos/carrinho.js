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
    default: 1,
    validate: {
      validator: function (value) {
        return Number.isInteger(value) && value > 0 && value <= 3;
      },
      message: "A quantidade deve ser um número inteiro entre 1 e 3.",
    },
  },
  reservedUntil: {
    type: Date,
    required: true,
    validate: {
      validator: function (value) {
        const maxReservationPeriod = 15 * 24 * 60 * 60 * 1000; // 15 days in milliseconds
        const now = new Date();
        return value.getTime() - now.getTime() <= maxReservationPeriod;
      },
      message: "A reserva deve ser para no máximo 15 dias.",
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
