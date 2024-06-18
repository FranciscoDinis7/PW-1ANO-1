const jwt = require("jsonwebtoken");
const config = require("../config");

function Verify(token) {
  return new Promise((resolve, reject) => {
    jwt.verify(token, config.secret, (err, decoded) => {
      if (err) {
        reject();
      }
      return resolve(decoded);
    });
  });
}

function verifyToken(req, res, next) {
  let token = req.headers["x-access-token"];

  if (!token) {
    return res.status(400).send({ auth: false, message: "No token provided" });
  }

  Verify(token)
    .then((decoded) => {
      console.log("Valid Token");
      console.log("Decoded" + JSON.stringify(decoded, null, 2));
      req.roleUser = decoded.role;
      next();
    })
    .catch(() => {
      res
        .status(401)
        .send({ auth: false, message: "Failed to authenticate token" });
    });
}
module.exports = verifyToken;
