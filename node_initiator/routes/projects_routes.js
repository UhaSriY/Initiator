const config = require('../config');
const Promise = require('bluebird');
const express = require('express');
const router = express.Router();
Promise.promisifyAll(require('mysql/lib/Connection').prototype);
Promise.promisifyAll(require('mysql/lib/Pool').prototype);
const projects = require('../controller/projects');
const mysql = require('mysql');
const pool = Promise.promisifyAll(mysql.createPool(config.db));
const { upload } = require('../middlewares/upload');

router.post('/create', (req, res) => {
  projects
    .addProject(mysql, pool, req.body)
    .then((project_created_res) => {
      res.send(project_created_res);
    })
    .catch((err) => {
      res.send({ error: err });
    });
});

router.post('/listbyrc', (req, res) => {
  projects
    .getProjects(mysql, pool, req.body)
    .then((list_of_projects) => {
      res.send(list_of_projects);
    })
    .catch((err) => {
      res.send({ err: err });
    });
});

router.post('/uploadfile', upload, (req, res, next) => {
  res.send({
    message: 'File uploaded and details added',
    // file_uploaded_response,
    // file_details_added_response,
  });
  if (req.file) {
    projects
      .uploadFile(req)
      .then((file_uploaded_response) => {
        projects
          .addFileDetails(
            mysql,
            pool,
            req.body.research_coordinator_id,
            req.file.originalname,
            req.body.description
          )
          .then((file_details_added_response) => {
            res.send({
              message: 'File uploaded and details added',
              file_uploaded_response,
              file_details_added_response,
            });
          })
          .catch((err) => {
            res.status(500).send({ error: err });
          });
      })
      .catch((error) => {
        res.status(500).send({ error });
      });
  } else {
    res.status(500).send({ message: 'File not found' });
  }
});

module.exports = router;
