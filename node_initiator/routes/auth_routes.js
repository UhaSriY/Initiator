const Promise = require('bluebird');
const express = require('express');
const path = require('path');
const router = express.Router();
Promise.promisifyAll(require("mysql/lib/Connection").prototype);
Promise.promisifyAll(require("mysql/lib/Pool").prototype);
const functions = require("../controller/functions")
const fs = require('fs')
const kms_utils = require("../utils/kms")
const fse = require('fs-extra');
const cp = require('child_process');
const ec2Controller = require('../controller/ec2_createinstances');
const admins = require("./../controller/admins")
const jwt = require('jsonwebtoken');
const config = require('../config');

router.post('/register', (req, res, next) => {
    let datetime = Date.now();
    let userid = (req.body.firstname.replace(/\s+/g, '') + req.body.lastname.replace(/\s+/g, '')).substring(0,4) + datetime
    let newAdmin = {
        research_coordinator_id : userid,
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        username: req.body.username,
        password: req.body.password,
        email: req.body.email,
        profile_picture_file : req.body.profile_picture_file
    }
  
    admins.addAdmin(newAdmin, (admin, err) => {
        if (err) {
            console.log(err)
            res.json({
                success: false,
                msg: 'Failed to register user'
            });
        } else {
          console.log("in register")
          console.log(admin)
            res.send(admin)
        }
    });
  });
  
  // Authenticate
  router.post('/authenticate', (req, res, next) => {
    console.log("in authenticate")
    const username = req.body.username;
    const password = req.body.password;
  
    admins.getUserByUsername(req.body).then(user=>{
           admins.comparePassword(password, user[0].password, (err, isMatch) => {
            if (err) throw err;
            if (isMatch) {
                const token = jwt.sign({
                    data: user
                }, config.secret, {
                        expiresIn: 86400
                    });
                res.json({
                    success: true,
                    token: token,
                    user: {
                        firstname: user[0].firstname,
                        lastname: user[0].lastname,
                        username: user[0].username,
                        email: user[0].email,
                        research_coordinator_id : user[0].research_coordinator_id
                    }
                })
            } else {
                return res.json({
                    success: false,
                    msg: 'Wrong password'
                });
            }
        });
    })
  });
  

module.exports= router