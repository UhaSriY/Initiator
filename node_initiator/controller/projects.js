const Promise = require('bluebird');
const db = require('../utils/db');
const mysql = require('mysql');
const config = require('../config');
const aws = require('../config/aws');
const pool = Promise.promisifyAll(mysql.createPool(config.db));
const fs = require('fs');
const path = require('path');
const git = require('simple-git')(path.join(process.cwd() + '/../../'));
const fse = require('fs-extra');
const { reject } = require('bluebird');
const { s3, encryptStreamAndWrite } = require('../utils/s3');

// exports.addProjectImage = (mysql, pool, data)=>{
//   return new Promise((resolve, reject)=>{
//     Promise.using(db.getConnection(pool),(conn) =>{
//       conn.queryAsync(mysql.format(
//         `QUERY here`,
//         [values here]
//       )).then(add_relation_res=>{
//         resolve(add_relation_res);
//       }).catch(err=>{
//         reject({"status":"failure", err: err});
//       })
//     });
//   });
// }

exports.addProject = (mysql, pool, data) => {
  return new Promise((resolve, reject) => {
    Promise.using(db.getConnection(pool), (conn) => {
      conn
        .queryAsync(
          mysql.format(
            `INSERT INTO project (
            research_coordinator_id,
            name,
            description, 
            project_picture_file
          ) VALUES (?, ?, ?, ?)`,
            [
              data.research_coordinator_id,
              data.name,
              data.description,
              data.project_picture_file,
            ]
          )
        )
        .then((res) => {
          resolve(res);
        })
        .catch((err) => {
          reject({ msg: 'Project not be created' });
        });
    });
  });
};

exports.addCloudEntities = (mysql, pool, data) => {
  return new Promise((resolve, reject) => {
    Promise.using(db.getConnection(pool), (conn) => {
      conn
        .queryAsync(
          mysql.format(
            `INSERT INTO project (
            project_id,
            ec2_instance_id,
            ec2_url, 
            rds_details,
            s3_details,
            config,
            repo_urls
          ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
              data.project_id,
              data.ec2_instance_id,
              data.ec2_url,
              data.rds_details,
              data.s3_details,
              data.config,
              data.repo_urls,
            ]
          )
        )
        .then((res) => {
          resolve(res);
        })
        .catch((err) => {
          reject({ msg: 'Cloud entities could not be created' });
        });
    });
  });
};

exports.getCloudEntities = (mysql, pool, data) => {
  let query = `SELECT * FROM project where project_id = ?`;
  return new Promise((resolve, reject) => {
    Promise.using(db.getConnection(pool), (conn) => {
      conn
        .queryAsync(mysql.format(query, [data.project_id]))
        .then((res) => {
          resolve(res);
        })
        .catch((err) => {
          reject({ msg: 'Cloud retrieve cloud entity details' });
        });
    });
  });
};

exports.getProjects = (mysql, pool, data) => {
  let query = `SELECT * FROM project where research_coordinator_id = ?`;
  return new Promise((resolve, reject) => {
    Promise.using(db.getConnection(pool), (conn) => {
      conn
        .queryAsync(mysql.format(query, [data.research_coordinator_id]))
        .then((res) => {
          resolve(res);
        })
        .catch((err) => {
          reject({ msg: "Can't retrieve projects" });
        });
    });
  });
};

exports.uploadFile = (req) => {
  const kmsKeyId = keyData.KeyMetadata.KeyId;
  return new Promise((resolve, reject) => {
    const rsteram = fs.createReadStream(req.file.path);
    encryptStreamAndWrite(kmsKeyId, rsteram, req.file.filename)
      .then((s3Res) => {
        fs.unlink(req.file.path, (err) => {
          if (err) {
            console.log('Could not delete file' + req.file.path);
            console.error(err);
          }
        });
        resolve(s3Res);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

exports.addFileDetails = (
  mysql,
  pool,
  research_coordinator_id,
  filename,
  description
) => {
  let query = `INSERT INTO file (research_coordinator_id, filename, description) VALUES (?, ?, ?)`;
  return new Promise((resolve, reject) => {
    Promise.using(db.getConnection(pool), (conn) => {
      conn
        .queryAsync(
          mysql.format(query, [research_coordinator_id, filename, description])
        )
        .then((res) => {
          resolve(res);
        })
        .catch((err) => {
          reject(err);
        });
    });
  });
};
