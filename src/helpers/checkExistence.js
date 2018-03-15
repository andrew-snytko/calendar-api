const { NotFoundError } = require('./error');

module.exports = entity => {
  if (!entity) {
    throw new NotFoundError();
  }
  return entity;
};
