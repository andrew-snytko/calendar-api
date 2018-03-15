const {
  UnauthorizedError,
  ServerError,
  LogicError,
} = require('../../../helpers/error');
const { getAccessToken } = require('../../../services/auth');
const { createUser } = require('../../../db/repositories/user');
const {
  getToken,
  updateAccessToken,
} = require('../../../db/repositories/token');

module.exports.createUser = async (ctx, next) => {
  const { name = null, email, password } = ctx.request.body;
  if (!email || !password) {
    throw new LogicError('Email and password are required');
  }
  let user = await createUser({ name, email, password });
  if (!user) {
    throw new ServerError('Unable to create user');
  }
  ctx.state.user = user;
  await next();
};

module.exports.refreshUserAuthToken = async ctx => {
  const { accessToken, refreshToken } = ctx.request.body;
  if (!accessToken || !refreshToken) {
    throw new UnauthorizedError();
  }
  let tokenData = await getToken({ accessToken, refreshToken });
  if (!tokenData) {
    throw new UnauthorizedError();
  }
  const newAccessToken = getAccessToken(tokenData.userId);
  await updateAccessToken(newAccessToken, {
    userId: tokenData.userId,
    refreshToken,
  });
  ctx.body = {
    accessToken: newAccessToken,
    refreshToken,
  };
};
