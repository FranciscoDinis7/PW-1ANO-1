const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const EncomendaSchema = new Schema({
  clienteId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Client",
    required: true,
  },
  produtoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  quantidade: { type: Number, required: true },
  dataPedido: { type: Date, default: Date.now },
  status: {
    type: String,
    enum: ["encomendado", "cancelado"],
    default: "encomendado",
  },
  valorTotal: { type: Number, required: true },
});

module.exports = mongoose.model("Encomenda", EncomendaSchema);
