const Product = require("../data/modelos/Produtos");
const express = require("express");
const bodyParser = require("body-parser");
const UserService = require("../data/users/service");
const UserModel = require("../data/users/user");
const scopes = require("../data/users/scopes");
const verificacao = require("../midleware/verfytoken");
const autorizacao = require("../midleware/autentication");

function ProdutoRouter() {
  let router = express();
  const Users = UserService(UserModel);
  router.use(bodyParser.json({ limit: "100mb" }));
  router.use(bodyParser.urlencoded({ limit: "100mb", extended: true }));

  // Criar Produto e visualizar todos os produtos
  router
    .route("/")
    .post(verificacao, autorizacao(["admin"]), function (req, res, next) {
      const body = req.body;
      console.log("Produto:", body);
      Product.create(body)
        .then((product) => {
          console.log("Produto criado:", product);
          res.status(200).send(product);
        })
        .catch((err) => {
          console.log("Error:", err);
          res.status(500).send(err);
          next();
        });
    })
    .get(async function (req, res, next) {
      try {
        const { page = 1, limit = 10, sort, search } = req.query;
        const query = {};

        // Handle search across title, author, and category
        if (search) {
          const searchRegex = new RegExp(search, "i");
          query.$or = [
            { title: searchRegex },
            { author: searchRegex },
            { category: searchRegex },
          ];
        }

        // Fetch total count of products that match the query
        const totalItems = await Product.countDocuments(query);

        const products = await Product.find(query)
          .sort(sort)
          .skip((page - 1) * limit)
          .limit(parseInt(limit))
          .exec();

        res.json({ products, totalItems });
      } catch (err) {
        res.status(500).json({ message: err.message });
        next();
      }
    });

  // Painel de administrador para buscar produto por ID
  router
    .route("/painel/:id")
    .get(verificacao, autorizacao(["admin"]), function (req, res, next) {
      const productId = req.params.id;
      Product.findById(productId)
        .then((product) => {
          if (!product) {
            return res.status(404).send({ message: "Produto não encontrado" });
          }
          res.status(200).send(product);
        })
        .catch((err) => {
          console.log("Error:", err);
          res.status(500).send(err);
          next();
        });
    });

  // Atualizar um produto
  router
    .route("/:id")
    .put(verificacao, autorizacao(["admin"]), function (req, res, next) {
      const body = req.body;
      Product.findByIdAndUpdate(req.params.id, body, { new: true })
        .then((product) => {
          res.status(200).send(product);
        })
        .catch((err) => {
          console.log("Error:", err);
          res.status(500).send(err);
          next();
        });
    });

  // Excluir um produto
  router.route("/:id").delete(Users.authorize([scopes["admin"]])),
    function (req, res, next) {
      Product.findByIdAndDelete(req.params.id)
        .then((product) => {
          res.status(200).send(product);
        })
        .catch((err) => {
          console.log("Error:", err);
          res.status(500).send(err);
          next();
        });
    };

  // Vender um produto
  router.route("/:id/vender").post(function (req, res, next) {
    const quantitySold = req.body.quantity;
    Product.findById(req.params.id)
      .then((product) => {
        if (product.quantity < quantitySold) {
          res.status(400).send("Fora de stock");
          return;
        }

        product.quantity -= quantitySold;
        if (product.quantity <= product.minQuantity) {
          product.reorderAlert = true;
        }
        return product.save();
      })
      .then((product) => {
        res.status(200).send(product);
      })
      .catch((err) => {
        console.log("Error:", err);
        res.status(500).send(err);
        next();
      });
  });

  // Criar uma venda
  router
    .route("/venda")
    .post(verificacao, autorizacao(["admin"]), function (req, res, next) {
      const body = req.body;
      Sale.create(body)
        .then((sale) => {
          res.status(200).send(sale);
        })
        .catch((err) => {
          console.log("Error:", err);
          res.status(500).send(err);
          next();
        });
    });

  // Visualizar uma venda
  router.route("/venda/:id").get(function (req, res, next) {
    Sale.findById(req.params.id)
      .then((sale) => {
        res.status(200).send(sale);
      })
      .catch((err) => {
        console.log("Error:", err);
        res.status(500).send(err);
        next();
      });
  });

  // Listar todas as vendas
  router.route("/vendas").get(Users.authorize([scopes["admin"]])),
    function (req, res, next) {
      Sale.find({})
        .then((sales) => {
          res.status(200).send(sales);
        })
        .catch((err) => {
          console.log("Error:", err);
          res.status(500).send(err);
          next();
        });
    };

  // Visualizar um produtos
  router.route("/produto/:id").get(function (req, res, next) {
    Product.findById(req.params.id)
      .then((product) => {
        res.status(200).send(product);
      })
      .catch((err) => {
        console.log("Error:", err);
        res.status(500).send(err);
        next();
      });
  });
  return router;
}

module.exports = ProdutoRouter;
