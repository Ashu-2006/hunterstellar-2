const jwt = require("jsonwebtoken");

function signToken(userId) {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "3h" });
}

function signExpiredToken(userId) {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "-1s" });
}

function signInvalidToken() {
  return "invalid.token.string";
}

module.exports = { signToken, signExpiredToken, signInvalidToken };