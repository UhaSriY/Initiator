// Load the AWS SDK for Node.js
const http = require('http');
var AWS = require('aws-sdk');
var fs = require('fs');
const path = require('path');
const replace = require('replace-in-file');
AWS.config.loadFromPath('config/aws/development.json');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');

function createKeyPair(userKeyName) {
    return new Promise((resolve, reject) => {
        var ec2 = new AWS.EC2({ apiVersion: '2016-11-15' });
        var params = {
            KeyName: userKeyName
        };
        var timestamp = Date.now();
        var date = new Date(timestamp);
        var year = date.getFullYear();
        var month = date.getMonth() + 1;      // "+ 1" becouse the 1st month is 0
        var day = date.getDate();
        var hour = date.getHours();
        var minutes = date.getMinutes();
        var seconds = date.getSeconds()
        var seedatetime = '_' + month + '_' + day + '_' + year + '_' + hour + '_' + minutes + '_' + seconds;
        var fileName = userKeyName + seedatetime;
        ec2.createKeyPair(params, function (err, data) {
            if (err) {
                reject({ "Error": err });
            } else {
                resolve({ "key_pair": JSON.stringify(data) });
                fs.writeFile('./config/' + fileName + '.pem', data.KeyMaterial, function (err) {
                    if (err) throw err;
                })
            }
        });
    });
}

function createInstance(instanceParams) {
    let instancePromise = new AWS.EC2({ apiVersion: '2016-11-15' }).runInstances(instanceParams).promise();
    return instancePromise;
}

function createTags(tagParams) {
    let tagPromise = new AWS.EC2({ apiVersion: '2016-11-15' }).createTags(tagParams).promise();
    return tagPromise;
}

function describeVpcs() {
    return new Promise((resolve, reject) => {
        var ec2 = new AWS.EC2({ apiVersion: '2016-11-15' });
        ec2.describeVpcs(function (err, data) {
            if (err) {
                reject({ "Cannot Retrieve a VPC": err });
            } else {
                resolve({ "data": data });
            }
        })

    })
}
function createSecurityGroup(paramsSecurityGroup) {
    return new Promise((resolve, reject) => {
        var ec2 = new AWS.EC2({ apiVersion: '2016-11-15' });
        ec2.createSecurityGroup(paramsSecurityGroup, function (err, data) {
            if (err) {
                reject({ "Error": err });
            } else {
                resolve({ "Data": data });
            }
        })
    })
}

function authorize(paramsIngress) {
    return new Promise((resolve, reject) => {
        var ec2 = new AWS.EC2({ apiVersion: '2016-11-15' });
        ec2.authorizeSecurityGroupIngress(paramsIngress, function (err, data) {
            if (err) {
                reject({ "Error": err });
            } else {
                resolve({ "Data": data })
            }
        })
    })
}

function allocateElasticAddress(paramsAllocateAddress) {
    return new Promise((resolve, reject) => {
        var ec2 = new AWS.EC2({ apiVersion: '2016-11-15' });
        ec2.allocateAddress(paramsAllocateAddress, function (err, data) {
            if (err) {
                reject({ "Error": err });
            } else {
                resolve({ "Data": data });
            };
        })
    })
}

function associateElasticAddress(paramsAssociateAddress) {
    return new Promise((resolve, reject) => {
        var ec2 = new AWS.EC2({ apiVersion: '2016-11-15' });
        ec2.associateAddress(paramsAssociateAddress, function (err, data) {
            if (err) {
                reject({ "Error": err });
            } else {
                resolve({ "Data": data })
            };
        })
    })
}

function describeElasticIP(params) {
    return new Promise((resolve, reject) => {
        var ec2 = new AWS.EC2({ apiVersion: '2016-11-15' });
        ec2.describeAddresses(params, function (err, data) {
            if (err) {
                reject({ "Error": err });
            } else {
                resolve({ "Data": data })
            }
        })
    })
}

function waiter(instanceId) {
    let params = {
        InstanceIds: [instanceId],
        //Waiter configuration
        $waiter: {
            maxAttempts: 1000,
            delay: 10
        }
    }

    return new Promise((resolve, reject) => {
        var ec2 = new AWS.EC2({ apiVersion: '2016-11-15' });
        ec2.waitFor("instanceRunning", params, function (err, data) {
            if (err) {
                console.log("error: " + err)
                reject({ "Error": err });
            } else {
                resolve({ "Data": data })
            }
        })
    })
}

function setApiUrl(repoName, port) {
    return new Promise((resolve, reject)=>{
        http.get('http://checkip.amazonaws.com', (resp) => {
        let data = '';
        resp.on('data', (chunk) => {
            data += chunk;
        });

        resp.on('end', () => {
            let path = "../../"+repoName+"/ng_"+repoName+"/dist/template-front/assets/config.production.json"
            console.log(path)
            let ip_addr = data.split("\n")[0]
            let file_data=fs.readFileSync(path)
            file_data = JSON.parse(file_data)
            file_data.host = "http://"+ip_addr+":"+port+"/api"
            fs.writeFileSync(path,JSON.stringify(file_data))
            resolve(file_data)
        });

        }).on("error", (err) => {
        console.log("Error: " + err.message);
        reject({"err":err})
        });
    })
}

function createS3(s3Bucket) {
    return new Promise((resolve, reject) => {
        //create S3 Service Object
        var s3 = new AWS.S3({ apiVersion: '2006-03-01' });
        var timestamp = Date.now();
        var date = new Date(timestamp);
        var year = date.getFullYear();
        var month = date.getMonth() + 1;      // "+ 1" becouse the 1st month is 0
        var day = date.getDate();
        var hour = date.getHours();
        var minutes = date.getMinutes();
        var seconds = date.getSeconds();
        s3White = s3Bucket.replace(/\s+/g, '');
        //manipulating the s3Bucket;
        var manipulatedName = s3White.toLowerCase();
        var seedatetime = '-' + month + '-' + day + '-' + year + '-' + hour + '-' + minutes + '-' + seconds;
        //Create the parameters for calling create Bucket
        var bucketParams = {
            // Bucket: manipulatedName + seedatetime
            Bucket: s3Bucket
        };
        s3.createBucket(bucketParams, function (err, data) {
            if (err) {
                reject({ "Error in Promise": err });
            } else {
                resolve({ "s3": data })
            }
        })
    })
}

function createRDS(name) {
   
    return new Promise((resolve, reject) => {
        var rds_params = {
            DBInstanceClass: 'db.t3.small', /* required */
            DBInstanceIdentifier: name, /* required */
            Engine: 'mysql', /* required */
            AllocatedStorage: 20,
            MaxAllocatedStorage: 16384,
            Port: 3306,
            MasterUserPassword: name,
            MasterUsername: name,
            PubliclyAccessible : true
        };

        var rds = new AWS.RDS({ apiVersion: '2014-10-31' });
        rds_params.DBInstanceIdentifier = rds_params.DBInstanceIdentifier.replace(/\s+/g, '');
        rds.createDBInstance(rds_params, function (err, data) {
            if (err) {
                reject({ "Error": err });
            } else {
                resolve({ "Data": data })
            }
        })

    })
}

function describeRDS(instanceId) {
    return new Promise((resolve, reject) => {
        var rds = new AWS.RDS({ apiVersion: '2014-10-31' });
        rdsParams = {
            DBInstanceIdentifier:instanceId,
            Filters:[{
                Name:"db-instance-id",
                Values:[instanceId]
            }]

        };
        rds.describeDBInstances(rdsParams, function (err, data) {
            if (err) {
                reject({ "Error": err });
            } else {
                resolve({ "endpoint": data.DBInstances[0].Endpoint.Address ,"port":data.DBInstances[0].Endpoint.Port})
            }
        })

    })
}

function updateUserData(userData,domainName1, domainName2, elasticAddr, rds){
    let user_data = userData;
    console.log(user_data);
    console.log(domainName1,domainName2);
    return new Promise((resolve, reject) => {
    // user_data=user_data.replace(/{{First_Domain_Name}}/g, domainName1);
    // user_data=user_data.replace(/{{Sec_Domain_Name}}/g, domainName2);
    // user_data=user_data.replace(/{{Elastic_IP}}/g,elasticAddr);  
    // user_data=user_data.replace(/{{RDS}}/g,rds);
    // if(user_data == userData)
    // {
    //     console.log(user_data, userData);
    //     reject({"Error":"Userdata not replaced"});
    // }
    // else{
    //     console.log(user_data);
    //     resolve({"Data": user_data});
    // }
    resolve({"Data": user_data})
})
}

function describeInstance(InstanceId){
    params = {InstanceIds: [InstanceId]}
    return new Promise((resolve, reject)=>{
        var ec2 = new AWS.EC2({ apiVersion: '2016-11-15' });
        ec2.describeInstances(params,function(err, data){
            if (err) console.log(err, err.stack); 
            else(resolve(data));
        })
    })
}


function createHash(rc_username, project_name){
    let input =  rc_username.replace(/\s+/g, '')+project_name.replace((/\s+/g, ''))
    crypto.createHash('MD5',input)
} 
module.exports = {
    createKeyPair: createKeyPair,
    createInstance: createInstance,
    createTags: createTags,
    describeVpcs: describeVpcs,
    createSecurityGroup: createSecurityGroup,
    authorize: authorize,
    createS3: createS3,
    createRDS: createRDS,
    allocateElasticAddress: allocateElasticAddress,
    associateElasticAddress: associateElasticAddress,
    describeElasticIP: describeElasticIP,
    waiter: waiter,
    updateUserData:updateUserData,
    describeInstance:describeInstance,
    setApiUrl:setApiUrl,
    describeRDS:describeRDS
}