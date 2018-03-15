const rc = require('rc');
const path = require('path');

const APP_NAME = 'CALENDAR';

const baseConfig = {
  port: 3000,
  jwt: {
    secret: '0rRhjZE2)"BB{U/=XbH9JcSgYJA9)T',
    expireTime: 900,
  },
  db: {
    client: 'pg',
    version: '10.3',
    connection: {
      host: '127.0.0.1',
      port: 5432,
      user: 'postgres',
      password: '12345',
      database: 'calendar-dev',
      timezone: 'UTC',
    },
    migrations: {
      directory: path.join(__dirname, 'src', 'db', 'migrations'),
    },
    seeds: {
      directory: path.join(__dirname, 'src', 'db', 'seeds'),
    },
  },
};

const config = rc(APP_NAME, {
  dev: { ...baseConfig },
  test: {
    ...baseConfig,
    port: 3010,
    jwt: { ...baseConfig.jwt, expireTime: 86400 },
    db: {
      ...baseConfig.db,
      connection: { ...baseConfig.db.connection, database: 'calendar-test' },
    },
  },
  env: 'dev',
});

module.exports = { ...config[config.env], _: config._, fullConfig: config };
