const db = require('../utils/DB');

const {
  TRANSACTIONS,
} = require('./TableNames');

const defaultColumns = [
  `${TRANSACTIONS}.id`,
  `${TRANSACTIONS}.file_name`,
  `${TRANSACTIONS}.transaction_id`,
  `${TRANSACTIONS}.month`,
  `${TRANSACTIONS}.day`,
  `${TRANSACTIONS}.transaction`,
  `${TRANSACTIONS}.created_at`,
  `${TRANSACTIONS}.updated_at`,
];

class TransactionsRepository {
  async insert(data) {
    return db.transactions(TRANSACTIONS)
      .insert(data)
      .returning(defaultColumns);
  }

  async getByFileName(fileName) {
    return db.transactions(TRANSACTIONS)
      .select(defaultColumns)
      .where({
        file_name: fileName,
      })
      .first();
  }

  async deleteByFileName(fileName) {
    return db.transactions(TRANSACTIONS)
      .where({
        file_name: fileName,
      })
      .del();
  }
}

module.exports = TransactionsRepository;
