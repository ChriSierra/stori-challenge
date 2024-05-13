const express = require('express');
const serverless = require('serverless-http');

const { APP_NAME } = process.env;

const app = express();

app.use(express.json());

const routes = require('./src/routes');

app.use(`/api/${APP_NAME}`, routes);

// Global not found handler route
app.use((req, res) => res.status(404).json({
  error: 'Not Found',
}));

module.exports.handler = serverless(app);
