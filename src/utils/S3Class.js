const { S3 } = require('aws-sdk');

const { S3_BUCKET } = process.env;

const logName = 'S3Class: ';

class S3Class {
  constructor(keyValue, logger) {
    this.logger = logger;
    this.keyValue = keyValue;
  }

  async getObject() {
    const s3 = new S3();

    const params = {
      Bucket: S3_BUCKET,
      Key: this.keyValue,
    };

    this.logger(logName, `S3 getObject for bucket: ${params.Bucket} and key: ${JSON.stringify(this.keyValue)}`);

    return s3.getObject(params)
      .promise().then((data) => data);
  }
}

module.exports = S3Class;
