const db = require('..');
const bcrypt = require('bcrypt');
const checkExistence = require('../../helpers/checkExistence');
const { ServerError, LogicError } = require('../../helpers/error');

const table = () => db('users');

module.exports.createUser = data => {
  const salt = bcrypt.genSaltSync();
  const hash = bcrypt.hashSync(data.password, salt);
  return table()
    .insert(
      {
        name: data.name,
        email: data.email,
        password: hash,
      },
      ['id', 'name', 'email']
    )
    .then(([{ id, name, email }]) => {
      return { id, name, email };
    })
    .catch(err => {
      if (err.constraint === 'users_email_unique') {
        throw new LogicError('User already exists');
      }
      throw new ServerError('Unable to create user');
    });
};

module.exports.getUser = criteria => {
  return table()
    .select()
    .where(criteria)
    .first()
    .catch(err => {
      throw new ServerError('Unable to get user');
    })
    .then(result => {
      const user = checkExistence(result);
      delete user.password;
      return user;
    });
};

module.exports.getUserFull = criteria => {
  return table()
    .select()
    .where(criteria)
    .first()
    .catch(err => {
      throw new ServerError('Unable to get user');
    })
    .then(checkExistence);
};
