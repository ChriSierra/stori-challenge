const path = require('path');
const fs = require('fs');
const mustache = require('mustache');
const sendgrid = require('@sendgrid/mail');

const { SENDGRID_API_KEY, SENDER_EMAIL } = process.env;

sendgrid.setApiKey(SENDGRID_API_KEY);

class SendGridResource {
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

  async sendEmail() {
    this.template = await this.prepareTemplate();

    const message = {
      from: SENDER_EMAIL,
      to: this.email,
      text: this.template,
      html: this.template,
      data: this.data,
      subject: this.subject,
    };

    const response = await sendgrid.send(message);

    return {
      status: response[0].statusCode,
      date: response[0].headers.date,
      id: response[0].headers['x-message-id'],
    };
  }
}

module.exports = SendGridResource;
