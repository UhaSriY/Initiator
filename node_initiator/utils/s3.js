const AWS = require('aws-sdk');
const awsConfig = require('../config/aws');
const config = require('../config');
const kms = require('./kms');
const crypto = require('crypto');

exports.s3 = new AWS.S3({
  accessKeyId: awsConfig.S3BucketConfig.accessKeyId,
  secretAccessKey: awsConfig.S3BucketConfig.secretAccessKey,
});

exports.encryptStreamAndWrite = (keyId, rstream, objectKey) => {
  return new Promise((resolve, reject) => {
    kms
      .generateDataKey(keyId)
      .then((keyData) => {
        const iv = Buffer.alloc(16, 0);
        const cipher = crypto.createCipheriv(
          config.encryptionAlgorithm,
          keyData.Plaintext,
          iv
        );
        rstream.pipe(cipher);
        keyData.Plaintext = null;

        const params = {
          Body: cipher,
          Bucket: awsConfig.S3BucketConfig.name,
          Key: objectKey,
          Metadata: {
            ciphertextblob: keyData.CiphertextBlob.toString('hex'),
          },
          ServerSideEncryption: 'AES256',
        };
        this.s3.upload(params, {}, (err, data) => {
          if (err) {
            reject(err);
          } else {
            resolve(data);
          }
        });
      })
      .catch((err) => {
        reject(err);
      });
  });
};
