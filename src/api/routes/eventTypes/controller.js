const { getAllEventTypes } = require('../../../db/repositories/eventType');

module.exports.getAllEventTypes = async (ctx, next) => {
  const eventTypes = await getAllEventTypes();
  ctx.body = {
    rows: eventTypes,
    total: eventTypes.length,
  };
};
