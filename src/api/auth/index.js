const randToken = require('rand-token');
const { UnauthorizedError } = require('../../helpers/error');
const { getAccessToken, verifyAccessToken } = require('../../services/auth');
const { createToken, getToken } = require('../../db/repositories/token');
const { getUser } = require('../../db/repositories/user');

module.exports.jwtAuth = async (ctx, next) => {
  const accessToken = ctx.request.headers.authorization;
  if (!accessToken) {
    throw new UnauthorizedError();
  }
  const splittedToken = accessToken.split(' ')[1];
  const verifiedToken = verifyAccessToken(splittedToken);
  if (!verifiedToken) {
    throw new UnauthorizedError();
  }
  const user = await getUser({ id: verifiedToken.id });
  const tokenData = await getToken({ accessToken, userId: user.id });
  if (!tokenData) {
    throw new UnauthorizedError();
  }
  ctx.state.user = user;
  await next();
};

module.exports.getAuthResponse = async ctx => {
  const user = ctx.state.user;
  if (!user) {
    throw new UnauthorizedError();
  }
  const accessToken = getAccessToken(user.id);
  const refreshToken = randToken.uid(255);
  await createToken({ userId: user.id, accessToken, refreshToken });
  ctx.body = { ...ctx.state.user, accessToken, refreshToken };
};
