'use strict';

//Import specific operations to database
const userService = require('../services/userServices');
const bookService = require('../services/bookServices');
const cartService = require('../services/cartServices');
const multer = require('multer');
const fs = require('fs');

exports.addToCart = function(req, res){
    cartService.add(req.body, (err, data) => {
        if (err) {
            res.status(500).send(err);
        } 
        else 
            res.status(200).send(data);
    });
}

exports.getUserCarts = function(req, res){
    cartService.get(req.params.email, (err, data) => {
        if (err) {
            res.status(500).send(err);
        } 
        else 
            res.status(200).send(data);
    });
}

exports.remove = function(req, res){
    cartService.remove(req.body, (err, data) => {
        if (err) {
            res.status(500).send(err);
        } 
        else 
            res.status(200).send(data);
    });
}