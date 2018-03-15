const { LogicError } = require('../../../helpers/error');
const { SuccessResponse } = require('../../../helpers/response');
const {
  validateDateTime,
  validateDate,
  isBefore,
  toISOString,
  getUTCDate,
  getUTCBeginDay,
  getUTCEndDay,
  getUTCEndWeek,
  getUTCEndMonth,
} = require('../../../services/moment');
const {
  createEvent,
  getEvent,
  getEventsByTimeRange,
  getCountEventsByTimeRange,
  updateEvent,
  deleteEvent,
} = require('../../../db/repositories/event');
const { getEventType } = require('../../../db/repositories/eventType');
const { Event } = require('../../../services/event');

module.exports.createEvent = async ctx => {
  const {
    description = '',
    startDate,
    endDate = null,
    type,
  } = ctx.request.body;
  const user = ctx.state.user;
  let eventType = null;
  if (!type) {
    throw new LogicError('Event type is required');
  }
  if (!startDate || !validateDateTime(startDate)) {
    throw new LogicError('Invalid event date');
  }
  if (endDate && !validateDateTime(endDate)) {
    throw new LogicError('Invalid event end date');
  }
  if (endDate && isBefore(endDate, startDate)) {
    throw new LogicError('Invalid event time range');
  }
  try {
    eventType = await getEventType({ id: type });
  } catch (err) {
    throw new LogicError('Invalid event type');
  }
  const event = await createEvent({
    userId: user.id,
    eventTypeId: eventType.id,
    description,
    startDate: toISOString(startDate),
    endDate: endDate ? toISOString(endDate) : null,
  });
  ctx.body = new Event({ ...event, eventTypeName: eventType.name });
};

module.exports.updateEvent = async ctx => {
  const eventId = ctx.request.ctx.params.id;
  if (isNaN(eventId)) {
    throw new LogicError('Invalid event id');
  }
  const event = await getEvent({ id: eventId });
  const { description, startDate, endDate, type } = ctx.request.body;
  const newEventData = {};
  let eventType = { id: event.eventTypeId };
  if (description !== undefined) {
    newEventData.description = description;
  }
  if (startDate) {
    if (!validateDateTime(startDate)) {
      throw new LogicError('Invalid event date');
    }
    newEventData.startDate = toISOString(startDate);
  }
  if (endDate !== undefined) {
    if (!validateDateTime(endDate)) {
      throw new LogicError('Invalid event end date');
    }
    if (
      endDate &&
      isBefore(toISOString(endDate), newEventData.startDate || event.startDate)
    ) {
      throw new LogicError('Invalid event time range');
    }
    newEventData.endDate = endDate ? toISOString(endDate) : null;
  }
  if (type) {
    try {
      const newEventType = await getEventType({ id: type });
      eventType.id = newEventType.id;
      eventType.name = newEventType.name;
    } catch (err) {
      throw new LogicError('Invalid event type');
    }
  }
  if (!Object.keys(newEventData).length) {
    throw new LogicError('No data to update');
  }
  await updateEvent({ id: eventId }, newEventData);
  eventType = await getEventType({ id: eventType.id });

  ctx.body = new Event({
    ...event,
    ...newEventData,
    eventTypeName: eventType.name,
  });
};

module.exports.getEventsForToday = async ctx => {
  const { offset = 0, limit = 10 } = ctx.request.ctx.params;
  const startDate = getUTCDate(new Date());
  const endDate = getUTCEndDay(startDate);
  const criteria = {
    startDate,
    endDate,
  };
  const events = await getEventsByTimeRange(criteria, { offset, limit });
  const total = await getCountEventsByTimeRange(criteria);
  ctx.body = {
    rows: events.map(event => new Event(event)),
    total,
  };
};

module.exports.getEventsForCurrentWeek = async ctx => {
  const { offset = 0, limit = 10 } = ctx.request.ctx.params;
  const startDate = getUTCDate(new Date());
  const endDate = getUTCEndWeek(startDate);
  const criteria = {
    startDate,
    endDate,
  };
  const events = await getEventsByTimeRange(criteria, { offset, limit });
  const total = await getCountEventsByTimeRange(criteria);
  ctx.body = {
    rows: events.map(event => new Event(event)),
    total,
  };
};

module.exports.getEventsForCurrentMonth = async ctx => {
  const { offset = 0, limit = 10 } = ctx.request.ctx.params;
  const startDate = getUTCDate(new Date());
  const endDate = getUTCEndMonth(startDate);
  const criteria = {
    startDate,
    endDate,
  };
  const events = await getEventsByTimeRange(criteria, { offset, limit });
  const total = await getCountEventsByTimeRange(criteria);
  ctx.body = {
    rows: events.map(event => new Event(event)),
    total,
  };
};

module.exports.getEventsForTimeRange = async ctx => {
  const { date, offset = 0, limit = 10 } = ctx.request.ctx.params;
  if (!validateDate(date)) {
    throw new LogicError('Invalid date');
  }
  const startDate = getUTCBeginDay(date);
  const endDate = getUTCEndDay(date);
  const criteria = {
    startDate,
    endDate,
  };
  const events = await getEventsByTimeRange(criteria, { offset, limit });
  const total = await getCountEventsByTimeRange(criteria);
  ctx.body = {
    rows: events.map(event => new Event(event)),
    total,
  };
};

module.exports.deleteEvent = async ctx => {
  const eventId = ctx.request.ctx.params.id;
  if (isNaN(eventId)) {
    throw new LogicError('Invalid event id');
  }
  await getEvent({ id: eventId });
  await deleteEvent({ id: eventId });
  ctx.body = new SuccessResponse();
};
