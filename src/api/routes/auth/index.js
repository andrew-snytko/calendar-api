const Router = require('koa-router');
const { jwtAuth, getAuthResponse } = require('../../auth');
const { auth, logout } = require('./controller');

const router = new Router();

router.post('/', auth, getAuthResponse);

router.post('/logout', jwtAuth, logout);

module.exports = router;
