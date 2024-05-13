const assert = require('assert');

const { DATABASE_CONNECTION: connection } = process.env;

assert(connection, 'DATABASE_CONNECTION must be provided');

module.exports = {
  client: 'pg',
  connection,
  migrations: {
    directory: './migrations',
    tableName: 'migrations',
  },
};
