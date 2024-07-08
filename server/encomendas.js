const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const Encomenda = require("../data/modelos/encomenda");
const Product = require("../data/modelos/Produtos");

function SalesRouter() {
  const router = express.Router();
  router.use(bodyParser.json({ limit: "100mb" }));
  router.use(bodyParser.urlencoded({ limit: "100mb", extended: true }));

  // Rota para criar uma encomenda
  router.post("/encomenda", async (req, res) => {
    try {
      const { clienteId, produtoId, quantidade } = req.body;

      // Verificar a quantidade disponível do produto
      const produto = await Product.findById(produtoId);
      if (!produto) {
        return res.status(404).json({ error: "Produto não encontrado" });
      }
      if (produto.quantity < quantidade) {
        return res
          .status(400)
          .json({ error: "Quantidade insuficiente no estoque" });
      }

      // Diminuir a quantidade do produto
      produto.quantity -= quantidade;
      await produto.save();

      // Criar a nova encomenda
      const newEncomenda = new Encomenda({
        clienteId,
        produtoId,
        quantidade,
        valorTotal: produto.price * quantidade,
      });

      const savedEncomenda = await newEncomenda.save();
      res.status(201).json(savedEncomenda);
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: err.message });
    }
  });

  // Rota para obter todas as encomendas
  router.get("/encomendas", async (req, res) => {
    try {
      const encomendas = await Encomenda.find()
        .populate("clienteId")
        .populate("produtoId");
      res.status(200).json(encomendas);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Rota para obter encomendas por utilizador (cliente)
  router.get("/encomendas/cliente/:clienteId", async (req, res) => {
    try {
      const { clienteId } = req.params;
      const encomendas = await Encomenda.find({ clienteId })
        .populate("clienteId")
        .populate("produtoId");
      res.status(200).json(encomendas);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Rota para atualizar o estado de uma encomenda
  router.put("/encomenda/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const updatedEncomenda = await Encomenda.findByIdAndUpdate(
        id,
        { status },
        { new: true }
      );

      if (!updatedEncomenda) {
        return res.status(404).json({ error: "Encomenda não encontrada" });
      }

      res.status(200).json(updatedEncomenda);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  return router;
}

module.exports = SalesRouter;
