const path = require('path');
const fs = require('fs');
const mustache = require('mustache');
const AWS = require('aws-sdk');

const {
  AWS_REGION,
  SENDER_EMAIL,
} = process.env;

const logName = 'EmailClass: ';

class EmailClass {
  constructor(logger, email, template, subject, data) {
    this.logger = logger;
    this.email = email;
    this.template = template;
    this.data = data;
    this.subject = subject;
  }

  async prepareTemplate() {
    const pathFile = path.resolve(__dirname, `../../assets/email_templates/${this.template}.html`);
    const template = fs.readFileSync(pathFile, 'utf-8');

    return mustache.render(template, this.data);
  }

  async sendEmail(template) {
    const SES_CONFIG = {
      apiVersion: '2010-12-01',
      region: AWS_REGION,
    };

    const ses = new AWS.SES(SES_CONFIG);

    const params = {
      Destination: {
        ToAddresses: [this.email],
      },
      Message: {
        Body: {
          Html: {
            Charset: 'UTF-8',
            Data: template,
          },
          Text: {
            Charset: 'UTF-8',
            Data: template,
          },
        },
        Subject: {
          Charset: 'UTF-8',
          Data: this.subject,
        },
      },
      Source: SENDER_EMAIL,
    };

    ses.sendEmail(params, (err, data) => {
      if (err) {
        this.logger(logName, `${err}, ${err.stack}`);
      } else {
        this.logger(logName, `Email sent! Message ID: ${data.MessageId}`);
      }
    });
  }

  async sendEmailWithTemplate() {
    const template = await this.prepareTemplate();

    return this.sendEmail(template);
  }
}

module.exports = EmailClass;
