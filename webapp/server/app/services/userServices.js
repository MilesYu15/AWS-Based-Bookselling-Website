'use strict';
const config = require('../config');
const mysql = require('../mysql.js');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const logger = require('../winston.js');
const sdc = require('../statsd.js');
const AWS = require('aws-sdk');
AWS.config.update({region: 'us-east-1'});

const User = function (params) {
  this.email = params.email;
  this.firstname = params.firstname;
  this.lastname = params.lastname;
  this.password_salt = bcrypt.hashSync(params.password, 10);
}


exports.findByEmail = function (params, result) {
  let query_start = new Date().getTime();
  mysql.query(`SELECT * FROM users WHERE email = "${params}"`, (err, res) => {
    if (err) {
      logger.error("Error from query in search user process: " + params, { service: "Server" })
      console.log("error: ", err);
      result(err, null);
      return;
    }

    if (res.length) {
      logger.info("User successfully found " + res[0], { service: "Server" });
      result(null, res[0]);
      return;
    }
    let query_end = new Date().getTime();
    sdc.timing("Query-Get", query_end - query_start);
    // not found Customer with the id
    logger.info("User cannot be found" + params, { service: "Server" });
    result({ kind: "not_found" }, null);
  });
};

exports.register = function (params, result) {

  let newUser = new User(params);
  let query_start = new Date().getTime();
  mysql.query("INSERT INTO users SET ?", newUser, (err, res) => {
    if (err) {
      logger.error("Error from query in register process: " + newUser.email, { service: "Server" });
      console.log("error: ", err);
      result(err, null);
      return;
    }
    let query_end = new Date().getTime();
    sdc.timing("Query-Insert", query_end - query_start);
    logger.info("User successsfully created: " + newUser.email, { service: "Server" });
    result(null, res);
  });
};

exports.update = function (params, result) {

  let updatedUser = new User(params);
  let query_start = new Date().getTime();
  mysql.query("UPDATE users SET password_salt = ?, firstname = ?, lastname = ? WHERE email = ?",
    [updatedUser.password_salt, updatedUser.firstname, updatedUser.lastname, updatedUser.email], (err, res) => {

      if (err) {
        logger.error("Error from query in update process: " + updatedUser.email, { service: "Server" });
        console.log("error: ", err);
        result(err, null);
        return;
      }

      if (res.affectedRows == 0) {
        result({ code: "ER_USER_NOMATCH" }, null);
        logger.info("User update failed: No such user ", { service: "Server" });
        return;
      }

      let query_end = new Date().getTime();
      sdc.timing("Query-Update", query_end - query_start);

      const { password_salt, ...userWithoutHash } = updatedUser;
      const token = jwt.sign({ sub: updatedUser.email }, config.secret);
      result(null, { ...userWithoutHash, token });
      logger.info("User successfully updated " + updatedUser.email, { service: "Server" });
      return;
    });
};

exports.authenticate = function ({ email, password }, result) {
  let query_start = new Date().getTime();
  mysql.query(`SELECT * FROM users WHERE email = "${email}"`, (err, res) => {
    if (err) {
      logger.error("Error from query in authentication process: " + email, { service: "Server" });
      console.log("error: ", err);
      result(err, null);
      return;
    }

    let query_end = new Date().getTime();
    sdc.timing("Query-Get", query_end - query_start);

    if (res.length) {
      let user = res[0];
      if (user && bcrypt.compareSync(password, user.password_salt.toString('utf8'))) {
        const { password_salt, ...userWithoutHash } = user;
        const token = jwt.sign({ sub: user.email }, config.secret);
        result(null, { ...userWithoutHash, token });
        logger.info("User successfully authenticated " + user.email, { service: "Server" });
        return;
      }
      else {
        result({ code: "ER_AUTH_FAIL" }, null);
        logger.info("User authentication failed due to password mismatch: " + user.email, { service: "Server" });
        return;
      }
    }

    // not found Customer with the id
    result({ code: "ER_USER_NOMATCH" }, null);
    logger.info("User authentication failed: No such user", { service: "Server" });
  });
};

exports.reset_password = function (params, result) {
  const email = params.email;
  let query_start = new Date().getTime();
  mysql.query(`SELECT * FROM users WHERE email = "${email}"`, (err, res) => {
    if (err) {
      logger.error("Error from query in authentication process: " + email, { service: "Server" });
      console.log("error: ", err);
      result(err, null);
      return;
    }

    let query_end = new Date().getTime();
    sdc.timing("Query-Get", query_end - query_start);

    if (res.length) {
      let user = res[0];
      //Public SNS message
      var params = {
        Message: user.email, /* required */
        TopicArn: config.password_topic_arn
      };

      // Create promise and SNS service object
      var publishTextPromise = new AWS.SNS({ apiVersion: '2010-03-31' }).publish(params).promise();

      // Handle promise's fulfilled/rejected states
      publishTextPromise.then(
        function (data) {
          logger.info(`Message sent to the topic ${params.TopicArn}`, { service: "Server" });
          result(null, { message: "SNS message published for user: " + user.email });
        }).catch(
          function (err) {
            logger.error("Error publishing sns messages: " + user.email, { service: "Server" });
            console.log("error: ", err);
            result({ code: "Unknown" }, null);

          });
    }
    else {
      // not found Customer with the id
      result({ code: "ER_USER_NOMATCH" }, null);
      logger.info("Reset password failed: No such user", { service: "Server" });
    }
  });
}

exports.testUpdate = function (params, result) {

  mysql.query("UPDATE users SET firstname = ?, lastname = ? WHERE email = ?",
    [params.firstname, params.lastname, params.email], (err, res) => {

      if (err) {
        console.log("error: ", err);
        result(err, null);
        return;
      }

      if (res.affectedRows == 0) {
        // not found Customer with the id
        result({ kind: "not_found" }, null);
        return;
      }

      console.log(res);
      result(null, res);
    });
};