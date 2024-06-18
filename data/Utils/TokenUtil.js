const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const config = require("../../config");


const decodeToken = (token)=> {
    return new Promise((resolve, reject) => {
      jwt.verify(token, config.secret, (err, decoded) => {
        if (err) {
          reject();
        }
        return resolve(decoded);
      });
    });
}

const comparePassword  = (password, hash) => {
  return bcrypt.compare(password, hash);
}

const createToken = (user) => {
  let token = jwt.sign(
    { id: user._id, name: user.name, role: user.role.scopes },
    config.secret,
    {
      expiresIn: config.expiresIn,
    }
  );
  return { auth: true, token: token };
}

module.exports = {decodeToken, comparePassword, createToken};