var mongoose = require("mongoose");
let scopes = require("./scopes");

let Schema = mongoose.Schema;

let RoleSchema = new Schema({
  name: { type: String, required: true },
  scopes: [{ type: String, enum: [scopes["cliente"], scopes["admin"]] }],
});

let UserSchema = new Schema({
  name: { type: String, required: true, unique: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: [scopes["cliente"], scopes["admin"]] },
});

const User = mongoose.model("User", UserSchema);
module.exports = User;
