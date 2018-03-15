const config = require('./config');
const Koa = require('koa');
const logger = require('koa-logger');
const bodyParser = require('koa-bodyparser');
const Router = require('koa-router');
const cors = require('@koa/cors');

const { ServerError, NotFoundError } = require('./src/helpers/error');

const authRouter = require('./src/api/routes/auth');
const userRouter = require('./src/api/routes/users');
const eventRouter = require('./src/api/routes/events');
const eventTypeRouter = require('./src/api/routes/eventTypes');

const app = new Koa();

const mainRouter = new Router({
  prefix: '/api',
});

// error handling
app.use(async (ctx, next) => {
  try {
    await next();
    const status = ctx.status;
    if (status === 404) {
      throw new NotFoundError();
    }
  } catch (err) {
    if (err instanceof ServerError) {
      console.log(err.stack);
    }
    ctx.status = err.status || 500;
    ctx.body = {
      status: err.status,
      message: err.message || 'Internal Server Error',
    };
    ctx.app.emit('error', err, ctx);
  }
});

app.use(logger());

const routers = {
  '/auth': authRouter,
  '/users': userRouter,
  '/events': eventRouter,
  '/event-types': eventTypeRouter,
};
Object.entries(routers).forEach(([path, router]) => {
  mainRouter.use(path, router.routes(), router.allowedMethods());
});

// utils
app.use(cors());
app.use(bodyParser());

// routes
app.use(mainRouter.allowedMethods());
app.use(mainRouter.routes());

module.exports = app.listen(config.port, () =>
  console.log(`App started on port ${config.port}`)
);
