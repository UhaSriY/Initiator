const Promise = require('bluebird');
const express = require('express');
const path = require('path');
const router = express.Router();
Promise.promisifyAll(require('mysql/lib/Connection').prototype);
Promise.promisifyAll(require('mysql/lib/Pool').prototype);
const functions = require('../controller/functions');
const fs = require('fs');
const kms_utils = require('../utils/kms');
const fse = require('fs-extra');
const cp = require('child_process');
const ec2Controller = require('../controller/ec2_createinstances');
const request = require('request');
const config = require('../config');
// const inboundRules = fs.readFileSync('config/inboundRules.json', 'utf-8');
// const parsedRules = JSON.parse(inboundRules);
// let userData = fs.readFileSync('config/userdata', 'utf-8');
// console.log("Original User Data", userData);
// let buff, base64data;

router.post('/getscreens', (req, res) => {
  functions
    .getscreens()
    .then((screen_res) => {
      res.send(screen_res);
    })
    .catch((err) => {
      res.send({ error: err });
    });
});

router.post('/createconfigfile', (req, res) => {
  const folderName =
    '/Users/sasidharpasupuleti/Desktop/caps22/repos/initiator/node_initiator/new_config';
  try {
    if (!fs.existsSync(folderName)) {
      fs.mkdirSync(folderName);
      let data = fs.readFileSync('config/aws/development.json');
      fs.writeFileSync(
        '/Users/sasidharpasupuleti/Desktop/caps22/repos/initiator/node_initiator/new_config/dev.json',
        data
      );
      res.send({ success: 'folder created' });
    } else {
      res.send({ failure: 'folder exists' });
    }
  } catch (err) {
    res.send({ failure: err });
  }
});

router.post('/cloneARepo', (req, res) => {
  functions
    .cloneGitRepo(req.body.url)
    .then((git_res) => {
      res.send({ success: 'repo cloned' });
    })
    .catch((err) => {
      res.send({ failure: err });
    });
});

router.post('/createKms', (req, res) => {
  kms_utils.getKeyData().then((res) => {
    console.log(res);
  });
});

router.post('/copyconfig', (req, res) => {
  let pwd = process.cwd();
  let common_path = path.join(pwd + '/../../');
  let repo_folder_name = req.body.git_url.split('/').pop();
  let cloning_path = common_path + repo_folder_name;
  let cloning_path_backend =
    common_path + repo_folder_name + '/node_' + repo_folder_name + '/';
  let cloning_path_frontend =
    common_path + repo_folder_name + '/ng_' + repo_folder_name + '/';
  let cloning_path_backend_config = cloning_path_backend + 'config/';
  console.log(cloning_path_backend);
  console.log(cloning_path_frontend);

  functions
    .cloneGitRepo(req.body.git_url, cloning_path)
    .then((git_res) => {
      console.log({ success: 'repo cloned' });
      return fse.copySync(pwd + '/config/', cloning_path_backend_config);
    })
    .then((copy_res) => {
      if (!fs.existsSync(cloning_path_backend)) {
        console.log('b not there');
      }
      if (!fs.existsSync(cloning_path_frontend)) {
        console.log('f not there');
      }
      fs.writeFileSync(
        cloning_path_backend_config + 'git_cred/git_cred.json',
        JSON.stringify(req.body.git_creds)
      );
      fs.writeFileSync(
        cloning_path_backend_config + 'aws/development.json',
        JSON.stringify(req.body.aws_creds)
      );
      fs.writeFileSync(
        cloning_path_backend_config + 'aws/production.json',
        JSON.stringify(req.body.aws_creds)
      );
      fs.writeFileSync(
        cloning_path_backend_config + 'aws/kms/production.json',
        JSON.stringify(req.body.aws_kms_desc)
      );
      fs.writeFileSync(
        cloning_path_backend_config + 'aws/kms/development.json',
        JSON.stringify(req.body.aws_kms_desc)
      );
      fs.writeFileSync(
        cloning_path_backend_config + 'aws/s3/development.json',
        JSON.stringify(req.body.aws_s3_desc)
      );
      fs.writeFileSync(
        cloning_path_backend_config + 'aws/s3/production.json',
        JSON.stringify(req.body.aws_s3_desc)
      );
      fs.writeFileSync(
        cloning_path_backend_config + 'db/production.json',
        JSON.stringify(req.body.db_config)
      );
      fs.writeFileSync(
        cloning_path_backend_config + 'db/development.json',
        JSON.stringify(req.body.db_config)
      );
      fs.writeFileSync(
        cloning_path_frontend + 'src/assets/config.development.json',
        JSON.stringify(req.body.front_end_config_dev)
      );
      fs.writeFileSync(
        cloning_path_frontend + 'src/assets/config.production.json',
        JSON.stringify(req.body.front_end_config_prod)
      );
      fs.writeFileSync(
        cloning_path_frontend + 'src/assets/environment.json',
        JSON.stringify(req.body.front_end_env)
      );

      fs.appendFileSync(
        'out.txt',
        '\n backend npm install \n ===================================='
      );
      let b_npm = cp.spawnSync('npm', ['install'], {
        encoding: 'utf8',
        cwd: cloning_path_backend,
      });
      fs.appendFileSync('out.txt', b_npm.stdout);
      fs.appendFileSync('out.txt', b_npm.stderr);

      // fs.appendFileSync('out.txt',"\n forever install \n ====================================")
      // let forever = cp.spawnSync('npm',['install','forever','-g'], { encoding : 'utf8',cwd:cloning_path_backend })
      // fs.appendFileSync('out.txt',forever.stdout)
      // fs.appendFileSync('out.txt',forever.stderr)

      fs.appendFileSync(
        'out.txt',
        '\n frontend npm install \n ===================================='
      );
      let f_npm = cp.spawnSync('npm', ['install'], {
        encoding: 'utf8',
        cwd: cloning_path_frontend,
      });
      fs.appendFileSync('out.txt', f_npm.stdout);
      fs.appendFileSync('out.txt', f_npm.stderr);

      fs.appendFileSync(
        'out.txt',
        '\n frontend build \n ===================================='
      );
      // let f_serve = cp.spawnSync("node_modules/@angular/cli/bin/ng",['serve','--port', '4201'], { encoding : 'utf8',cwd:cloning_path_frontend  })
      let f_serve = cp.spawnSync(
        'node_modules/@angular/cli/bin/ng',
        ['build'],
        { encoding: 'utf8', cwd: cloning_path_frontend }
      );
      fs.appendFileSync('out.txt', f_serve.stdout);
      fs.appendFileSync('out.txt', f_serve.stderr);

      fs.appendFileSync(
        'out.txt',
        '\n forever start \n ===================================='
      );
      // let node_start = cp.spawnSync("node",['app.js','PORT=3040'], { encoding : 'utf8',cwd:cloning_path_backend  })
      let node_start = cp.spawnSync(
        'forever',
        ['start', 'app.js', 'PORT=3040'],
        { encoding: 'utf8', cwd: cloning_path_backend }
      );
      fs.appendFileSync('out.txt', node_start.stdout);
      fs.appendFileSync('out.txt', node_start.stderr);

      res.send({ success: 'check repo' });
    })
    .catch((err) => {
      console.log(err);
      res.send({ failure: err });
    });
});

router.post('/updateapiurl', (req, res) => {
  let repo_name = req.body.repoName;
  let port = req.body.port;
  ec2Controller.setApiUrl(repo_name, port).then((ip_addr) => {
    console.log(ip_addr);
    res.send({ updated_ip: ip_addr });
  });
});

router.post('/createrds', (req, res) => {
  // var params = {
  //     DBInstanceClass: 'db.t3.small', /* required */
  //     DBInstanceIdentifier: req.body.name, /* required */
  //     Engine: 'mysql', /* required */
  //     AllocatedStorage: 20,
  //     MaxAllocatedStorage: 16384,
  //     Port: 3306,
  //     MasterUserPassword: 'adminrds12345',
  //     MasterUsername: 'adminrds',
  //     PubliclyAccessible : true
  // };
  ec2Controller
    .createRDS(req.body)
    .then((rds_res) => {
      res.send({ rds_created: rds_res, input: params });
    })
    .catch((err) => {
      console.log(err);
      res.send({ err: err });
    });
});

router.post('/describedbisntance', (req, res) => {
  ec2Controller
    .describeRDS(req.body.name)
    .then((desc_res) => {
      res.send(desc_res);
    })
    .catch((err) => {
      console.log(err);
      res.send({ err: err });
    });
});

router.post('/createinstance', (req, res) => {
  let nameReal = req.body.name;
  // let domainName = req.body.domainNameInput;
  // let otherDomain = req.body.otherDomain;
  let name = nameReal.replace(/\s+/g, '');
  let instanceId, elasticIPGroup, elasticIP, s3Location, sendTagRes, publciIp;
  let SecurityGroupId;
  let full_res = {};

  ec2Controller
    .createRDS(name)
    .then((rds_created) => {
      full_res.rds_res = rds_created;
      return ec2Controller.createS3(name);
    })
    .then((s3_created_res) => {
      full_res.s3_res = s3_created_res;
      return ec2Controller.createKeyPair(name);
    })
    .then(() => {
      //upload key to s3
      return ec2Controller.describeVpcs(); //call the function here
    })
    .then((vpcRes) => {
      // => take the output here and use it in {}
      let vpc = vpcRes.data.Vpcs[0].VpcId;
      var paramsSecurityGroup = {
        Description: 'This Security Group Belongs to ' + name,
        GroupName: name,
        VpcId: vpc,
      };
      return ec2Controller.createSecurityGroup(paramsSecurityGroup);
    })
    .then((securityGroup) => {
      let inboundRules = fs.readFileSync('config/inboundRules.json', 'utf-8');
      let parsedRules = JSON.parse(inboundRules);
      SecurityGroupId = securityGroup.Data.GroupId;
      var paramsIngress = {
        GroupId: SecurityGroupId,
        IpPermissions: parsedRules,
      };
      return ec2Controller.authorize(paramsIngress);
    })
    .then((auth) => {
      console.log('Ingress Successfully Set', auth.Data);
      // elasticIP = elasticID.Data.PublicIp;
      // elasticIPGroup = elasticID.Data.AllocationId;
      let userData = fs.readFileSync('config/userdata', 'utf-8');
      return ec2Controller.updateUserData(
        userData,
        'domainName',
        'otherDomain',
        'elasticIP',
        'rdsurl'
      );
    })
    .then((data) => {
      let buff, base64data;
      buff = new Buffer.from(data.Data);
      base64data = buff.toString('base64');
      instanceParams = {
        ImageId: 'ami-035d5a5a4d0106e2e',
        InstanceType: 't2.micro',
        KeyName: name,
        MinCount: 1,
        MaxCount: 1,
        UserData: base64data,
        SecurityGroupIds: [SecurityGroupId],
      };
      return ec2Controller.createInstance(instanceParams);
    })
    .then((createRes) => {
      full_res.ec2_res = createRes;
      instanceId = createRes.Instances[0].InstanceId;
      console.log(name);
      let tagParams = {
        Resources: [instanceId],
        Tags: [
          {
            Key: 'Name',
            Value: name,
          },
        ],
      };
      return ec2Controller.createTags(tagParams);
    })
    .then((tagRes) => {
      sendTagRes = tagRes;
      // res.send({ "instanceId": instanceId, "tagRes": tagRes, "status": "true" })
      return ec2Controller.waiter(instanceId);
    })
    .then((waiterRes) => {
      console.log(
        JSON.stringify(
          waiterRes['Data']['Reservations'][0]['Instances'][0]['State']
        )
      );
      var paramsAssociateAddress = {
        AllocationId: elasticIPGroup,
        InstanceId: instanceId, //Instance ID goes here
      };
      return ec2Controller.describeInstance(instanceId);
    })
    .then((desc_res) => {
      // elasticA = elasticIPAddress.Data.Addresses[0].PublicIp;
      let publciIp =
        desc_res['Reservations'][0]['Instances'][0]['PublicIpAddress'];
      let data = {
        'Key Pair Name': name,
        'Instance ID': instanceId,
        'Security Group': SecurityGroupId,
        'Public IP Group': publciIp,
        'S3 Bucket Identifier': 's3Location',
        'RDS Instance Name': 'RDSInstance',
        tagRes: sendTagRes,
      };
      res.send({ success: data, full_res: full_res });
      console.log(data);
    })
    .catch((err) => {
      console.log(err);
      res.send({ Err: err });
    });
});

router.post('/getauth0token', (req, res) => {
  const options = {
    method: 'POST',
    url: config.auth0.url,
    headers: {
      'content-type': 'application/json',
    },
    body: `{"client_id":"${config.auth0.client_id}","client_secret":"${config.auth0.client_secret}","audience":"${config.auth0.audience}","grant_type":"${config.auth0.grant_type}"}`,
  };
  request(options, (error, response) => {
    if (error) throw new Error(error);
    access_token = JSON.parse(response.body).access_token;
    config.auth0.token = JSON.parse(response.body).access_token;
    res.send(response);
  });
});

router.get('/getauth0clients', (req, res) => {
  const options = {
    method: 'GET',
    url: config.auth0.url + '/api/v2/clients',
    headers: {
      'content-type': 'application/json',
      Authorization: 'Bearer ' + config.auth0.token,
    },
  };
  request(options, (error, response) => {
    if (error) throw new Error(error);
    res.send(response);
  });
});

module.exports = router;
