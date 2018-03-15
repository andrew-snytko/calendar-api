const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const config = require('../../config');
const { UnauthorizedError, TokenExpiredError } = require('../helpers/error');

module.exports.getAccessToken = id => {
  const token = jwt.sign({ id }, config.jwt.secret, {
    expiresIn: config.jwt.expireTime,
  });
  return `Bearer ${token}`;
};

module.exports.verifyAccessToken = accessToken => {
  try {
    return jwt.verify(accessToken, config.jwt.secret);
  } catch (err) {
    switch (err.message) {
      case 'jwt expired':
        throw new TokenExpiredError();
      default:
        throw new UnauthorizedError();
    }
  }
};

module.exports.comparePasswords = (password, hash) => {
  return bcrypt.compareSync(password, hash);
};
