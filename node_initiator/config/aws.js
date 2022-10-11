const AWS = require('aws-sdk');
const path = require('path');
const rootPath = path.normalize(__dirname + '/..');
const env = process.env.NODE_ENV || 'development';
AWS.config.loadFromPath(rootPath + '/config/aws/' + env + '.json');

const KMSConfig = {
  development: {
    client: {
      apiVersion: '2014-11-01',
      region: 'us-east-2',
    },
    keySpec: 'AES_256',
  },
  production: {
    client: {
      apiVersion: '2014-11-01',
      region: 'us-east-2',
    },
    keySpec: 'AES_256',
  },
};
exports.KMSConfig = KMSConfig[env];
exports.KMS = (config) => {
  config = config || KMSConfig[env].client;
  return new AWS.KMS(config);
};

const S3BucketConfig = {
  development: {
    apiVersion: '2006-03-01',
    name: require('./aws/s3/development.json').bucket_name,
    accessKeyId: require('./aws/s3/development.json').accessKeyId,
    secretAccessKey: require('./aws/s3/development.json').secretAccessKey,
  },
  production: {
    apiVersion: '2006-03-01',
    name: require('./aws/s3/production.json').bucket_name,
    accessKeyId: require('./aws/s3/development.json').accessKeyId,
    secretAccessKey: require('./aws/s3/development.json').secretAccessKey,
  },
};
exports.S3BucketConfig = S3BucketConfig[env];
exports.S3 = () => {
  return new AWS.S3();
};
