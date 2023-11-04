const { decodedToken } = require("../services/jwt")

const validateToken = async (req, res, next) => {
  let token;
  let authHeader = req.headers.Authorization || req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer")) {
    token = authHeader.split(" ")[1];
    try {
      const decoded = await decodedToken(token);
      req.user = decoded.user;
      next();
    } catch (err) {
     return res.status(401).json({
       title: "Authentication Failed",
       message:
         "The provided token is either invalid or expired. Please log in again.",
     });
    }
  }

  if (!token) {
      return res.status(401).json({
        title: "Unauthorized",
        message:
          "Unauthorized. Please provide a valid Bearer token.",
      });
  }
};


const validatePasswordToken = async (req, res, next) => {
  const token = req.params.token; 

  if (!token) {
    return res.status(401).json({
      title: "Unauthorized",
      message: "Unauthorized. Please provide a valid token.",
    });
  }

  try {
    const decoded = await decodedToken(token);
    req.user = decoded.user;
    next();
  } catch (err) {
    return res.status(401).json({
      title: "Authentication Failed",
      message:
        "The provided token is either invalid or expired. Please log in again.",
    });
  }
};


module.exports = { validateToken, validatePasswordToken };
