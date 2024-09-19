const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

const jwtConfig = {
  secret: process.env.JWT_SECRET || 'your_jwt_secret',
  expiresIn: '1h', 
};

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, jwtConfig.secret, { expiresIn: jwtConfig.expiresIn });
};

const verifyToken = (token) => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, jwtConfig.secret, (err, decoded) => {
      if (err) {
        return reject(err);
      }
      resolve(decoded);
    });
  });
};

module.exports = {
  generateToken,
  verifyToken,
};