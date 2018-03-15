const Router = require('koa-router');
const { jwtAuth } = require('../../auth');
const { getAllEventTypes } = require('./controller');

const router = new Router();

router.get('/', jwtAuth, getAllEventTypes);

module.exports = router;
