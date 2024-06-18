const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const SaleSchema = new Schema({
    product: { type: Schema.Types.ObjectId, ref: 'Product' },
    quantity: Number,
    date: { type: Date, default: Date.now }
  });

  module.exports = mongoose.model('Sale', SaleSchema);