const Promise = require('bluebird');
const db = require('../utils/db');
const mysql = require('mysql');
const config = require('../config');
const pool = Promise.promisifyAll(mysql.createPool(config.db));
const fs = require('fs')
const path = require('path');
const git = require('simple-git')(path.join(process.cwd()+"/../../"));
const fse = require('fs-extra');
const { reject } = require('bluebird');

console.log(process.cwd())
exports.copyDir = (dirPath, dirDest) =>{
    return new Promise((resolve,reject)=>{
        fse.copy(dirPath, dirDest);
        resolve({"copied":true})
    }).catch(err=>{
        reject({"copied":false})
    })
//    try{ 
//        return fse.copy(dirPath, dirDest);
//         // return({"success":"copied " + dirPath + " to " + dirDest})
//     }
//    catch (err) {
//        return err;
//     }
}

exports.callQuery = (mysql, pool, data, query)=>{
    return new Promise((resolve, reject)=>{
        Promise.using(db.getConnection(pool),conn=>{

            if(data.length==0) {
            conn.queryAsync(mysql.format(query)).then(res=>{
                resolve(res);
            }).catch(err=>{
                reject({"error":err});
            });
            }

            else{
                conn.queryAsync(mysql.format(query, data)).then(res=>{
                    resolve(res);
                }).catch(err=>{
                    reject({"error":err});
                });
            }

        });
    });
}

exports.getscreens = () =>{
    let query = `select * from Screen where Display= 'Yes' Order by OrderNo, Date`;
    return this.callQuery(mysql, pool, [], query);
}

exports.createConfigFolder = () => {
    let folderName = "config"
}   

exports.cloneGitRepo = (url, given_cloning_path) =>{
    let pwd = process.cwd();
    let common_path = path.join(pwd+"/../../");
    let repo_folder_name = ((url.split("/")).pop())
    let cloning_path =  common_path+repo_folder_name
    
    return new Promise((resolve,reject)=>{
        if(!fs.existsSync(given_cloning_path)){
            let userName = config.git_cred.user_name;
            let password = config.git_cred.token;
            git.addConfig('user.email','sasidhar.pasupuleti@live.com')
            git.addConfig('user.name','sasidharpasupuleti')
            let gitHubUrl = `https://${userName}:${password}@github.com/${userName}/${repo_folder_name}`;
            resolve (git.clone(gitHubUrl,given_cloning_path))
        }
        else{
            reject ({"failure":"could not clone"})
        }
    });
    
}