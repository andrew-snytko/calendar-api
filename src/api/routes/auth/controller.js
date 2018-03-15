const { UnauthorizedError } = require('../../../helpers/error');
const { SuccessResponse } = require('../../../helpers/response');
const { getUserFull } = require('../../../db/repositories/user');
const { destroyToken } = require('../../../db/repositories/token');
const { comparePasswords } = require('../../../services/auth');

module.exports.auth = async (ctx, next) => {
  const { email, password } = ctx.request.body;
  if (!email || !password) {
    throw new UnauthorizedError();
  }
  let user = null;
  try {
    user = await getUserFull({ email });
  } catch (err) {
    throw new UnauthorizedError();
  }
  if (!comparePasswords(password, user.password)) {
    throw new UnauthorizedError();
  }
  ctx.state.user = user;
  await next();
};

module.exports.logout = async ctx => {
  const accessToken = ctx.request.headers.authorization;
  const user = ctx.state.user;
  if (!accessToken) {
    throw new UnauthorizedError();
  }
  const result = await destroyToken({ accessToken, userId: user.id });
  if (!result) {
    throw new UnauthorizedError();
  }
  ctx.body = new SuccessResponse();
};
