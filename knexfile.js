const config = require('./config');

module.exports = {
  dev: config.fullConfig.dev.db,
  test: config.fullConfig.test.db,
};
