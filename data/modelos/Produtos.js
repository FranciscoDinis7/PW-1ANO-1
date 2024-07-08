const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ProductSchema = new Schema({
  title: { type: String, required: true },
  category: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  foto: { type: String, required: true },
  rating: { type: Number },
  quantity: { type: Number },
});

module.exports = mongoose.model("Product", ProductSchema);
