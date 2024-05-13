const knex = require('knex');

const {
  TIMEZONE = 'America/Mexico_City',
  DATABASE_CONNECTION,
} = process.env;

const timeout = 5000;

const config = {
  client: 'pg',
  pool: {
    min: 1,
    max: 10,
    afterCreate: function afterPoolCreate(con, cb) {
      con.query(`SET timezone = '${TIMEZONE}';`, (err) => {
        cb(err, con);
      });
    },
    idleTimeoutMillis: timeout,
    createTimeoutMillis: timeout,
    acquireTimeoutMillis: timeout,
  },
  acquireConnectionTimeout: timeout,
  connectionTimeout: timeout,
  connection: DATABASE_CONNECTION,
};

const transactions = knex(config);

module.exports = {
  transactions,
};
