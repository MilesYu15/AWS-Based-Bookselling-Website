'use strict';

//Import specific operations to database
const userService = require('../services/userServices');
const multer = require('multer');
const fs = require('fs');


exports.search = function(req, res){
    userService.findByEmail(req.params.email, (err, data) => {
        if (err) {
          if (err.kind === "not_found") {
            res.status(404).send({
              message: `Not found Customer with id ${req.params.email}.`
            });
          } else {
            res.status(500).send({
              message: "Error retrieving Customer with id " + req.params.email
            });
          }
        } else res.send(data);
    });
}

//Register a new user
exports.registerUser = function(req, res){

    userService.register(req.body, (err, data) => {
        if (err) {
          res.status(500).send(err);
        } 
        else res.status(200).send(data);
    });
}

//Authenticate an user for with password
exports.authenticate = function(req, res, next){
    userService.authenticate(req.body, (err, data) => {
        if (err) {
          res.status(500).send(err);
        } else {
          res.status(200).json(data);
        }
    });
}

exports.update = function(req, res){

    userService.update(req.body, (err, data) => {
        if (err) {
          res.status(500).send(err);

        } 
        else {
          res.status(200).json(data)
        };
    });
}

exports.reset = function(req, res){
  userService.reset_password(req.body, (err, data) => {
    if (err) {
      res.status(500).send(err);
    } 
    else {
      res.status(200).json(data)
    };
}); 
}

exports.testUpdate = function(req, res){
  console.log(req.body);

  userService.testUpdate(req.body, (err, data) => {
      if (err) {
        if (err.kind === "Cannot update") {
            res.status(404).send({
            message: `Cannot update user with id ${req.body.email}.`
          });
        } 
        else {
            res.status(500).send({
            message: "Error retrieving user with id " + req.body.email
          });
        }
      } 
      else {res.status(200).send(data)};
  });
}

exports.logout = function(req, res){
  res.status(200).send({"Message": "User " + req.params.email + " logged out"});
}

//Throw error if error object is present
let renderErrorResponse = (response) => {
    const errorCallback = (error) => {
        if (error) {
            response.status(500);
            response.json({
                message: error.message
            });
        }
    }
    return errorCallback;
};