const Router = require('koa-router');
const { jwtAuth } = require('../../auth');
const {
  createEvent,
  updateEvent,
  deleteEvent,
  getEventsForToday,
  getEventsForCurrentWeek,
  getEventsForCurrentMonth,
  getEventsForTimeRange,
} = require('./controller');

const router = new Router();

router.post('/', jwtAuth, createEvent);

router.put('/:id', jwtAuth, updateEvent);

router.get('/today/:offset?/:limit?', jwtAuth, getEventsForToday);

router.get('/week/:offset?/:limit?', jwtAuth, getEventsForCurrentWeek);

router.get('/month/:offset?/:limit?', jwtAuth, getEventsForCurrentMonth);

router.get('/date/:date/:offset?/:limit?', jwtAuth, getEventsForTimeRange);

router.delete('/:id', jwtAuth, deleteEvent);

module.exports = router;
