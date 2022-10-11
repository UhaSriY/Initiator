const Promise = require('bluebird');
const fs = require('fs');
const path = require('path');
const aws = require('aws-sdk');

const config = require('../config');
const awsConfig = require('../config/aws');
const KMS = awsConfig.KMS();
const KMSConfig = awsConfig.KMSConfig;

const createKey = (keyConfig) => {
  keyConfig = keyConfig || {};
  return new Promise((resolve, reject) => {
    KMS.createKey(keyConfig, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
};
exports.createKey = createKey;

exports.getKeyData = (keyConfig) => {
  return new Promise((resolve, reject) => {
    keyConfig = keyConfig || {};
    keyConfig.Tags = keyConfig.Tags || [];
    keyConfig.Tags.push({ TagKey: 'CreatedBy', TagValue: 'mds-' + config.env });

    const kmsJsonPath = path.join(config.root, 'config/aws/kms', config.env + '.json');
    fs.stat(kmsJsonPath, (err, stats) => {
      if (err || !stats.isFile()) {
        createKey(keyConfig)
          .then((keyData) => {
            fs.writeFileSync(kmsJsonPath, JSON.stringify(keyData));
            resolve(keyData);
          }).catch(err => {
            reject(err);
          });
      } else {
        resolve(JSON.parse(fs.readFileSync(kmsJsonPath)));
      }
    });
  });
};

exports.generateDataKey = (keyId) => {
  return new Promise((resolve, reject) => {
    KMS.generateDataKey({ KeyId: keyId, KeySpec: KMSConfig.keySpec }, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
}

exports.decrypt = (keyId, ciphertextBlob) => {
  return new Promise((resolve, reject) => {
    KMS.decrypt({
      CiphertextBlob: ciphertextBlob,
      KeyId: keyId
    }, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data.Plaintext);
      }
    });
  });
};

