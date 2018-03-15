const db = require('..');
const checkExistence = require('../../helpers/checkExistence');
const { ServerError } = require('../../helpers/error');

const table = () => db('tokens');

module.exports.createToken = data => {
  return table()
    .insert(data, 'id')
    .then(([id]) => id)
    .catch(err => {
      throw new ServerError('Unable to create token');
    });
};

module.exports.getToken = criteria => {
  return table()
    .select()
    .where(criteria)
    .first()
    .then(checkExistence)
    .catch(err => {
      throw new ServerError('Unable to get token');
    });
};

module.exports.updateAccessToken = (newAccessToken, criteria) => {
  return table()
    .where(criteria)
    .update({ accessToken: newAccessToken })
    .catch(err => {
      throw new ServerError('Unable to update token');
    });
};

module.exports.destroyToken = criteria => {
  return table()
    .where(criteria)
    .delete()
    .catch(err => {
      throw new ServerError('Unable to update token');
    })
    .then(result => result);
};
