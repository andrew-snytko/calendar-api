const db = require('..');
const checkExistence = require('../../helpers/checkExistence');
const { ServerError } = require('../../helpers/error');

const table = () => db('events');

module.exports.createEvent = data => {
  return table()
    .insert(data, ['id', 'createdAt', 'updatedAt'])
    .then(([{ id, createdAt, updatedAt }]) => {
      return { ...data, id, createdAt, updatedAt };
    })
    .catch(err => {
      throw new ServerError('Unable to create event');
    });
};

module.exports.updateEvent = (criteria, data) => {
  return table()
    .where(criteria)
    .update({ ...data, updatedAt: new Date() })
    .catch(err => {
      throw new ServerError('Unable to update event');
    });
};

module.exports.getEvent = criteria => {
  return table()
    .select()
    .where(criteria)
    .first()
    .catch(err => {
      throw new ServerError('Unable to get event by id');
    })
    .then(checkExistence);
};

module.exports.getEventsByTimeRange = (
  { startDate, endDate },
  { limit, offset }
) => {
  return table()
    .select()
    .leftJoin('eventTypes', 'eventTypes.id', 'events.eventTypeId')
    .where('startDate', '>=', startDate)
    .andWhere('endDate', '<', endDate)
    .select(['events.*', 'eventTypes.name as eventTypeName'])
    .limit(limit)
    .offset(offset)
    .catch(err => {
      throw new ServerError('Unable to get event by id');
    });
};

module.exports.getCountEventsByTimeRange = ({ startDate, endDate }) => {
  return table()
    .where('startDate', '>=', startDate)
    .andWhere('endDate', '<', endDate)
    .count()
    .first()
    .then(result => parseInt(result.count))
    .catch(err => {
      throw new ServerError('Unable to get event by id');
    });
};

module.exports.deleteEvent = id => {
  return table()
    .where(id)
    .del()
    .catch(err => {
      throw new ServerError('Unable to delete event');
    });
};
