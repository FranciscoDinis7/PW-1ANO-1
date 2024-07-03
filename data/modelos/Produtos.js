const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ProductSchema = new Schema({
  title: String,
  category: String,
  description: String,
  price: Number,
  foto: String,
  rating: Number,
  quantity: Number,
  minQuantity: Number, 
  reorderAlert: Boolean 
});

  module.exports = mongoose.model('Product', ProductSchema);