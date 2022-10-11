const path = require('path');
const rootPath = path.normalize(__dirname + '/..');
const env = process.env.NODE_ENV || 'development';

const config = {
  development: {
    env: env,
    root: rootPath,
    port: process.env.PORT || 3040,
    encryptionAlgorithm: 'AES-256-CBC',
    fileUploadDest: path.join(rootPath, 'uploads/'),
    secret: 'yoursecret',
  },

  production: {
    env: env,
    root: rootPath,
    port: process.env.PORT,
    encryptionAlgorithm: 'AES-256-CBC',
    fileUploadDest: '/encryptedVolume/',
    secret: 'yoursecret',
  },
};

config[env].db = require(path.join(rootPath, 'config/db/', env + '.json'));
config[env].git_cred = require(path.join(
  rootPath,
  'config/git_cred/git_cred.json'
));
config[env].auth0 = require(path.join(
  rootPath,
  'config/auth0/',
  env + '.json'
));

module.exports = config[env];
