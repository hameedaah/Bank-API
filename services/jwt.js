const jwt = require("jsonwebtoken");


const generateToken = async (payload, expiresIn = "20m") => {
  const generatedToken = await jwt.sign(payload, process.env.SECRET_KEY, {
    expiresIn,
  });
  return generatedToken;
};


const decodedToken = async (token) => {
  const decoded = jwt.verify(token, process.env.SECRET_KEY);
  return decoded;
};



module.exports = {
  generateToken,
  decodedToken,
};
