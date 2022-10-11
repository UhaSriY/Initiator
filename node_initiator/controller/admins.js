const config = require('../config');
const Promise = require('bluebird');
const db = require('../utils/db');
const bcrypt = require('bcryptjs');
const mysql = require('mysql');
const pool = Promise.promisifyAll(mysql.createPool(config.db));


exports.addAdminProfile = (mysql, pool, data) => {

    return new Promise((resolve, reject) => {
      Promise.using(db.getConnection(pool), (conn) => {
        conn.queryAsync(mysql.format(
          `INSERT INTO research_coordinator (
            firstname,
            lastname,
            username, 
            email,
            password,
            research_coordinator_id,
            profile_picture_file
          ) VALUES (?, ?, ?, ?, ?, ?,?)`,
          [  
            data.firstname,
            data.lastname,
            data.username,
            data.email,
            data.password,
            data.research_coordinator_id,
            data.profile_picture_file
          ]
        )).then(res => {
          resolve(res);
        }).catch(err => {
          console.log(err)
            console.log("Try other username")
        //   reject({"msg":"could not be created"});
        });
      });
    });
  };

  module.exports.addAdmin = function(newUser, callback) {
    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(newUser.password, salt, (err, hash) => {
          console.log(hash)
        if(err) throw err;
        newUser.password = hash;
        this.addAdminProfile(mysql,pool,newUser);
        callback (newUser)
      });
    });
  }

  module.exports.getUserByUsername = function(data,callback) {
    return new Promise((resolve, reject) => {
        Promise.using(db.getConnection(pool), (conn) => {
            console.log("in get user by name")
          conn.queryAsync(mysql.format(
            `SELECT * FROM research_coordinator WHERE username = ?`,[data.username]
          )).then(res => {
            // callback(res);
            resolve(res);
          }).catch(err => {
            reject(err);
          });
        });
        
      });
  }

  module.exports.comparePassword = function(hash, candidatePassword, callback) {
    console.log("called compare passord")
    console.log(candidatePassword)
    console.log(hash)
    bcrypt.compare(hash, candidatePassword, (err, isMatch) => {
      if(err) throw err;
      callback(null,isMatch);
    });
  }