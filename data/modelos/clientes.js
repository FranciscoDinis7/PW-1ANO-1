// models/client.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ClientSchema = new Schema({
  name: String,
  email: String,
  address: String,
  phone: String
});

module.exports = mongoose.model('Client', ClientSchema);