const jwt = require("jsonwebtoken");
const config = require("../../config");
const bcrypt = require("bcrypt");
const { request } = require("express");
const { findOne } = require("./user");
const User = require("./user");
const { UserSchema } = require("./user");

function UserService(UserModel) {
  let service = {
    create,
    createToken,
    verifyToken,
    findUser,
    createPassword,
    comparePassword,
    authorize,
    findAllUsers,
    findOne,
  };

  async function create(user) {
    try {
      const hashPassword = await createPassword(user);

      let newUserWithPassword = {
        ...user,
        password: hashPassword,
      };

      let newUser = new UserModel(newUserWithPassword);
      await save(newUser);

      const userData = await UserModel.findOne({ _id: newUser._id });

      if (!userData) {
        throw new Error("User not found");
      }

      const newCart = new ShoppingCart({
        items: [],
        total: 0,
        user: userData._id,
      });

      await save(newCart);

      userData.carrinho = newCart._id;
      await save(userData);

      return userData;
    } catch (error) {
      if (error.code === 11000) {
        throw new Error(
          "Duplicate key error: A user with this name already exists."
        );
      }
      throw error;
    }
  }

  function save(model) {
    return new Promise(function (resolve, reject) {
      model
        .save()
        .then(() => resolve("User created"))
        .catch((err) => reject(`There is a problem with register ${err}`));
    });
  }

  function createToken(user) {
    let token = jwt.sign(
      { id: user._id, name: user.name, role: user.role },
      config.secret,
      {
        expiresIn: config.expirePassword,
      }
    );
    return { auth: true, token };
  }

  function verifyToken(token) {
    return new Promise((resolve, reject) => {
      jwt.verify(token, config.secret, (err, decoded) => {
        if (err) {
          reject();
        }
        return resolve(decoded);
      });
    });
  }

  function findUser({ email, password }) {
    return new Promise(function (resolve, reject) {
      UserModel.findOne({ email })
        .then((user) => {
          if (!user) return reject("User not found");
          return comparePassword(password, user.password).then((match) => {
            if (!match) return reject("User not valid");
            return resolve(user);
          });
        })
        .catch((err) => {
          reject("There is a problem with the user ${err}");
        });
    });
  }

  function createPassword(user) {
    return bcrypt.hash(user.password, config.saltRounds);
  }

  function comparePassword(password, hash) {
    return bcrypt.compare(password, hash);
  }

  function authorize(scopes) {
    return (request, response, next) => {
      const token = request.headers["x-access-token"];

      if (!token) {
        return response.status(401).json({ message: "No token provided" });
      }

      verifyToken(token)
        .then((decoded) => {
          const { role } = decoded; // Assuming 'role' is included in the decoded token

          console.log("route scopes:", scopes);
          console.log("user role:", role);

          const hasAuthorization = scopes.some((scope) => role.includes(scope));

          if (role && hasAuthorization) {
            request.roleuser = role; // Attach role to the request for further use if needed
            next();
          } else {
            response.status(403).json({ message: "Forbidden" });
          }
        })
        .catch((err) => {
          response
            .status(401)
            .json({ message: "Failed to authenticate token" });
        });
    };
  }

  function findAllUsers() {
    return new Promise(function (resolve, reject) {
      UserModel.find().then((users) => {
        if (!users) return reject("Users not found");
        return resolve(users).catch((err) => {
          reject("There is a problem with the user ${err}");
        });
      });
    });
  }

  function findOne(id) {
    return new Promise(function (resolve, reject) {
      UserModel.findById(id).then((user) => {
        if (!user) return reject("User not found");
        return resolve(user).catch((err) => {
          reject("There is a problem with the user ${err}");
        });
      });
    });
  }

  return service;
}

module.exports = UserService;
