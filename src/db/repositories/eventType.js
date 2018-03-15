const db = require('..');
const checkExistence = require('../../helpers/checkExistence');
const { ServerError } = require('../../helpers/error');

const table = () => db('eventTypes');

module.exports.getAllEventTypes = () => {
  return table()
    .select()
    .catch(err => {
      throw new ServerError('Unable to get event type');
    });
};

module.exports.getEventType = criteria => {
  return table()
    .select()
    .where(criteria)
    .first()
    .then(checkExistence)
    .catch(err => {
      throw new ServerError('Unable to get event type');
    });
};
