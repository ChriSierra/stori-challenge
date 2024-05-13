const {
  TRANSACTIONS,
} = require('../src/repositories/TableNames');

exports.up = (knex) => knex.schema.createTable(TRANSACTIONS, (table) => {
  table.increments('id');
  table.string('file_name');
  table.integer('transaction_id');
  table.integer('month');
  table.integer('day');
  table.double('transaction');
  table.timestamps(true, true);
});

exports.down = (knex) => knex.schema.dropTable(TRANSACTIONS);
