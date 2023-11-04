const bcrypt = require("bcrypt");


const hashing = async (password) => {
  const hashedPassword = await bcrypt.hash(password, 10);

  return hashedPassword;
};

const comparePasswords = async (password, hashedPassword) => {
  const isPasswordValid = await bcrypt.compare(password, hashedPassword);
  return isPasswordValid;
};

module.exports = {
  hashing,
  comparePasswords,
};
