const path = require('path');
const fs = require('fs');
const S3Class = require('../utils/S3Class');
const CsvClass = require('../utils/CsvClass');
const EmailClass = require('../utils/EmailClass');
const TransactionsRepository = require('../repositories/TransactionsRepository');
const SendGridResource = require('../resources/SendGridResource');

const {
  IS_OFFLINE,
} = process.env;

const logName = 'TransactionsService: ';

const months = {
  1: 'January',
  2: 'February',
  3: 'March',
  4: 'April',
  5: 'May',
  6: 'June',
  7: 'July',
  8: 'August',
  9: 'September',
  10: 'October',
  11: 'November',
  12: 'December',
};

class TransactionsService {
  constructor(keyValue, logger, email) {
    this.logger = logger;
    this.keyValue = keyValue;
    this.email = email;
  }

  reportTransactions(transactions) {
    // Variables initialization
    let debitTransactions = 0;
    let amountDebitTransactions = 0;

    let creditTransactions = 0;
    let amountCreditTransaction = 0;

    let totalBalance = 0;

    const transactionsPerMonth = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
      6: 0,
      7: 0,
      8: 0,
      9: 0,
      10: 0,
      11: 0,
      12: 0,
    };

    const monthlyTransactions = [];

    // Start summarizing transactions
    transactions.forEach((transaction) => {
      let {
        transaction: amount,
      } = transaction;

      const {
        month,
      } = transaction;

      amount = Number(amount);

      totalBalance += amount;

      if (amount < 0) {
        debitTransactions += 1;
        amountDebitTransactions += amount;
      }

      if (amount > 0) {
        creditTransactions += 1;
        amountCreditTransaction += amount;
      }

      transactionsPerMonth[month] += 1;
    });

    Object.keys(transactionsPerMonth).forEach((element) => {
      if (transactionsPerMonth[element] > 0) {
        monthlyTransactions.push({
          month: months[element],
          value: transactionsPerMonth[element],
        });
      }
    });

    // Return full report
    return {
      transactions,
      debitTransactions,
      creditTransactions,
      monthlyTransactions,
      averageDebitTransactions: Number.parseFloat(amountDebitTransactions / debitTransactions).toFixed(2),
      averageCreditTransactions: Number.parseFloat(amountCreditTransaction / creditTransactions).toFixed(2),
      amountDebitTransactions,
      amountCreditTransaction,
      totalBalance: Number.parseFloat(totalBalance).toFixed(2),
    };
  }

  prepareInsert(transactions, separator) {
    return transactions.map((transaction) => ({
      file_name: this.keyValue,
      transaction_id: transaction.id,
      month: transaction.date.split(separator)[0],
      day: transaction.date.split(separator)[1],
      transaction: transaction.transaction,
    }));
  }

  async getBufferFromFile() {
    if (IS_OFFLINE === 'true') {
      const pathFile = path.resolve(__dirname, '../../docs/transactions.csv');

      return { Body: fs.readFileSync(pathFile) };
    }

    const S3 = new S3Class(this.keyValue, this.logger);

    return S3.getObject();
  }

  async sendCommunication(report) {
    const subject = 'Your transactions report is ready';

    this.logger(logName, 'send email using sendgrid');
    const sendGridClass = new SendGridResource(this.logger, this.email, 'report_transactions', subject, report);

    return sendGridClass.sendEmail();
  }

  async getTransactions() {
    this.logger(logName, 'get transactions service');

    const bufferFile = await this.getBufferFromFile();
    const csvClass = new CsvClass(bufferFile.Body);
    const transactions = csvClass.processFile();

    // Check if there is at least one transaction saved by file name
    const transactionsRepository = new TransactionsRepository();
    const checkByFileName = await transactionsRepository.getByFileName(this.keyValue);
    if (checkByFileName) { // If exist at least one register by file then delete all registers associated
      await transactionsRepository.deleteByFileName(this.keyValue);
    }

    // Performing insert transactions
    const bulkData = this.prepareInsert(transactions, '/');
    await transactionsRepository.insert(bulkData);

    // Create summary and send email
    const report = this.reportTransactions(bulkData);
    await this.sendCommunication(report);

    return report;
  }
}

module.exports = TransactionsService;
