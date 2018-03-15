const Router = require('koa-router');
const { getAuthResponse } = require('../../auth');
const { createUser, refreshUserAuthToken } = require('./controller');

const router = new Router();

router.post('/', createUser, getAuthResponse);

router.post('/token/refresh', refreshUserAuthToken);

module.exports = router;
