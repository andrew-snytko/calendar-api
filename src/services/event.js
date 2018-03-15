const { ServerError } = require('../helpers/error');

class Event {
  constructor({
    id,
    description,
    startDate,
    endDate,
    createdAt,
    updatedAt,
    eventTypeId,
    eventTypeName,
  }) {
    if (
      !id ||
      !startDate ||
      !createdAt ||
      !updatedAt ||
      !eventTypeId ||
      !eventTypeName
    ) {
      throw new ServerError('Error creating new Event');
    }
    this.id = id;
    this.description = description;
    this.startDate = startDate;
    this.endDate = endDate;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.type = {
      id: eventTypeId,
      name: eventTypeName,
    };
  }
}

module.exports.Event = Event;
