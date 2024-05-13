const TransactionsService = require('../services/TransactionsService');

const TransactionsController = module.exports;

const logName = 'TransactionsController: ';

const { DEFAULT_FILE } = process.env;

const handlerErrors = (error, res) => {
  if (error.code === 'NoSuchKey') {
    return res.status(404).json({ error: 'File Not Found' });
  }

  return res.status(500).json({ error: 'Error get' });
};

TransactionsController.getTransactions = async (req, res) => {
  const logger = console.log;

  try {
    const { email } = req.params;

    logger(logName, `Sending report transactions to email: ${email}`);

    const transactions = new TransactionsService(DEFAULT_FILE, logger, email);
    const transactionsFromFile = await transactions.getTransactions();

    return res.json(transactionsFromFile);
  } catch (error) {
    logger(logName, error);

    return handlerErrors(error, res);
  }
};
