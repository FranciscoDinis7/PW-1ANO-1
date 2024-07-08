const bodyParser = require("body-parser");
const express = require("express");
const autorizacao = require("../midleware/autentication");
const verificacao = require("../midleware/verfytoken");

const UserModel = require("../data/users/user");
const UserService = require("../data/users/service");
const Client = require("../data/modelos/clientes");

function AuthRouter() {
  let router = express();
  const Users = UserService(UserModel);
  router.use(bodyParser.json({ limit: "100mb" }));
  router.use(bodyParser.urlencoded({ limit: "100mb", extended: true }));

  
  // criar User
  router.route("/register").post(function (req, res, next) {
    const body = req.body;
    
    if (!body.role) {
      body.role = 'cliente';
    }
  
    console.log("User:", body);
  
    Users.create(body)
      .then(() => Users.createToken(body))
      .then((response) => {
        console.log("User token:", response);
        res.status(200).send(response);
      })
      .catch((err) => {
        console.log("Error:", err);
        res.status(500).send(err);
        next();
      });
  });
  

  router.route("/me").get(function (req, res, next) {
    let token = req.headers["x-access-token"];
    console.log("Token:", token);

    if (!token) {
      return res
        .status(401)
        .send({ auth: false, message: "No token provided." });
    }
    return Users.verifyToken(token)
      .then((decoded) => {
        console.log(decoded);
        res.status(202).send({ auth: true, decoded });
      })
      .catch((err) => {
        console.log("Error:", err);
        res.status(500);
        res.send(err);
        next();
      });
  });

  // Login
  router.post("/login", async (req, res, next) => {
    const { email, password } = req.body;
    try {
      const user = await Users.findUser({ email, password });
      if (!user) {
        return res.status(401).json({ message: "Credenciais inválidas" });
      }
      const token = await Users.createToken(user);
      console.log("Utilizador autenticado com sucesso:", user);
      console.log("Token gerado:", token);

      res.status(200).json({ auth: true, token: token.token});
    } catch (error) {
      console.error("Erro ao fazer login:", error);
      if (error === "User not found" || error === "Password does not match") {
        res
          .status(401)
          .json({
            message: "Email ou senha inválidos. Por favor, tente novamente.",
          });
      } else {
        res.status(500).json({ message: "Erro ao fazer login" });
      }
      next(error);
    }
  });


  // Logout
router.post("/logout", (req, res) => {
  // Optionally, you can perform some server-side logic here
  console.log("User logged out");
  res.status(200).json({ message: "Logout successful" });
});


  // Pesquisa
  router.route("/search").get(function (req, res, next) {
    let searchTerm = req.query.term;
    console.log("Search Term:", searchTerm);

    if (!searchTerm) {
      return res
        .status(400)
        .send({ error: true, message: "Nenhuma pesquisa encontrada" });
    }

    Users.search(searchTerm)
      .then((response) => {
        console.log("Resultados:", response);
        res.status(200).send(response);
      })
      .catch((err) => {
        console.log("Error:", err);
        res.status(500).send(err);
        next();
      });
  });

  // Autorização
  function authorize(roles = []) {
    if (typeof roles === "string") {
      roles = [roles];
    }

    return [
      (req, res, next) => {
        if (roles.length && !roles.includes(req.user.role)) {
          return res.status(401).json({ message: "Unauthorized" });
        }
        next();
      },
    ];
  }

  router.route("/admin").get(authorize("admin"), function (req, res, next) {});

  router
    .route("/cliente")
    .get(authorize("cliente"), function (req, res, next) {});

  router.route("/public").get(function (req, res, next) {});

  // Criar um cliente
  router.route("/cliente").post(function (req, res, next) {
    const body = req.body;
    Client.create(body)
      .then((client) => {
        res.status(200).send(client);
      })
      .catch((err) => {
        console.log("Error:", err);
        res.status(500).send(err);
        next();
      });
  });

  // Atualizar um cliente
  router.route("/cliente/:id").put(function (req, res, next) {
    const body = req.body;
    Client.findByIdAndUpdate(req.params.id, body, { new: true })
      .then((client) => {
        res.status(200).send(client);
      })
      .catch((err) => {
        console.log("Error:", err);
        res.status(500).send(err);
        next();
      });
  });

  // Excluir um cliente
  router.route("/cliente/:id").delete(function (req, res, next) {
    Client.findByIdAndRemove(req.params.id)
      .then((client) => {
        res.status(200).send(client);
      })
      .catch((err) => {
        console.log("Error:", err);
        res.status(500).send(err);
        next();
      });
  });

  // Listar todos os clientes
  router
    .route("/clientes")
    .get(verificacao, autorizacao(["admin"]), function (req, res, next) {
      Users.findAllUsers()
        .then((clients) => {
          res.status(200).send(clients);
        })
        .catch((err) => {
          console.log("Error:", err);
          res.status(500).send(err);
          next();
        });
    });

  return router;
}

module.exports = AuthRouter;
