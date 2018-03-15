class UnauthorizedError extends Error {
  constructor() {
    super('Unauthorized');
    this.status = 401;
    this.expose = true;
  }
}

class NotFoundError extends Error {
  constructor(message) {
    super(message || 'Not Found');
    this.status = 404;
    this.expose = true;
  }
}

class LogicError extends Error {
  constructor(message) {
    super(message);
    this.status = 400;
    this.expose = true;
  }
}

class ServerError extends Error {
  constructor(message) {
    super(message);
    this.status = 500;
    this.expose = true;
  }
}

class TokenExpiredError extends Error {
  constructor() {
    super('Access token expired');
    this.status = 426;
    this.expose = true;
  }
}

module.exports = {
  UnauthorizedError,
  NotFoundError,
  LogicError,
  ServerError,
  TokenExpiredError,
};
