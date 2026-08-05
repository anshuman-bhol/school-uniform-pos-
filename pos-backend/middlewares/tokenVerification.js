const authenticate = require("./auth");

const isVerifiedUser = authenticate;

module.exports = { isVerifiedUser };