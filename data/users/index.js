const Users = require('./user');
const UserService = require('./service');
const service = UserService(Users);

module.exports = service;