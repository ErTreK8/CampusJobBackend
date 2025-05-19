// src/utils/generatePassword.js
const crypto = require('crypto');

const generateRandomPassword = () => {
  return crypto.randomBytes(16).toString('hex').slice(0, 12);
};

module.exports = { generateRandomPassword };