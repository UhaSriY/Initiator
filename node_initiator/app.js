//import modules
const express = require ('express');
var http = require('http');
const https = require('https');
const fs = require('fs');
const bodyparser = require('body-parser');
const path = require('path');
const cors = require('cors');
const morgan = require('morgan');
const mysql = require('mysql');
const config = require('./config');
const kms = require('./utils/kms');

const app = express();
const frontend = config.root.split("/").pop().replace("node","ng")
// Get KMS key data
// kms.getKeyData()
//   .then(keyData => {
    app.use(morgan('tiny'));    // HTTP request logger
    app.use(cors());
    app.use(bodyparser.json({limit: '50mb'}));
    app.use(bodyparser.urlencoded({limit: '50mb', extended: true}));
    app.use(express.static(path.join(config.root, '/../'+frontend+"/dist/")));
    // app.use('/api', require('./routes/files')(keyData));
    app.use('/api', require('./routes/routes'));
    app.use('/auth', require('./routes/auth_routes'));
    app.use('/project', require('./routes/projects_routes'));

    app.get('*', (req, res) => {
      res.sendStatus(404);
    });
    // Get SSL key and certificate
    // const options = {
    //   key: fs.readFileSync('key.pem'),
    //   cert: fs.readFileSync('cert.pem')
    // };
   
    http.createServer( app).listen(config.port, () => {
        console.log('Server started at port:' + config.port);
      });
    
    // https.createServer(options, app).listen(config.port, () => {
    //   console.log('Server started at port:' + config.port);
    // });

  // }).catch(err => {
  //   console.log('Could not retrieve key data');
  //   console.error(err);
  //   process.exit(1);
  // });
