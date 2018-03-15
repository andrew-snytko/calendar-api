const moment = require('moment');

const DATE_TIME_FORMAT = 'YYYY-MM-DD HH:mm:ss';
const DATE_FORMAT = 'YYYY-MM-DD';

module.exports.validateDateTime = date => {
  return moment(date, DATE_TIME_FORMAT).isValid();
};

module.exports.validateDate = date => {
  return moment(date, DATE_FORMAT).isValid();
};

module.exports.isBefore = (start, end) => {
  const startDate = moment(start, DATE_TIME_FORMAT);
  const endDate = moment(end, DATE_TIME_FORMAT);
  return startDate.isBefore(endDate);
};

module.exports.toISOString = date => {
  return moment(date, DATE_TIME_FORMAT).toISOString();
};

module.exports.getUTCDate = date => {
  return moment.utc(date, DATE_TIME_FORMAT).format(DATE_TIME_FORMAT);
};

module.exports.getUTCBeginDay = date => {
  const beginDate = moment(date, DATE_TIME_FORMAT).utcOffset(0);
  beginDate.set({ hour: 0, minute: 0, second: 0, millisecond: 0 });
  beginDate.add(1, 'days');
  return beginDate.format(DATE_TIME_FORMAT);
};

module.exports.getUTCEndDay = date => {
  const endDate = moment(date, DATE_TIME_FORMAT).utcOffset(0);
  endDate.set({ hour: 0, minute: 0, second: 0, millisecond: 0 });
  endDate.add(2, 'days');
  return endDate.format(DATE_TIME_FORMAT);
};

module.exports.getUTCEndWeek = date => {
  const endDate = moment(date, DATE_TIME_FORMAT).utcOffset(0);
  endDate.endOf('week');
  endDate.set({ hour: 0, minute: 0, second: 0, millisecond: 0 });
  endDate.add(2, 'days');
  return endDate.format(DATE_TIME_FORMAT);
};

module.exports.getUTCEndMonth = date => {
  const endDate = moment(date, DATE_TIME_FORMAT).utcOffset(0);
  endDate.endOf('month');
  endDate.set({ hour: 0, minute: 0, second: 0, millisecond: 0 });
  endDate.add(2, 'days');
  return endDate.format(DATE_TIME_FORMAT);
};
