'use strict';
const config = require('../config');
const mysql = require('../mysql.js');
const formdata = require('form-data');
const logger = require('../winston.js');
const sdc = require('../statsd.js');

const carItem = function(params){
    this.bookID = params.bookID;
    this.buyer = params.buyer;
}

exports.add = function(params, result){

    let newItem = new carItem(params);
    let query_start = new Date().getTime();
    mysql.query("INSERT INTO carts SET ?", newItem, (err, res) => {
        if (err) {
          logger.error("Book cannot be added to cart: " + newItem.bookID, {service: "Server"});
          console.log("error: ", err);
          result(err, null);
          return;
        }
        
        let query_end = new Date().getTime();
        sdc.timing("Query-Insert", query_end-query_start);
        sdc.increment("Book-Cart-"+newItem.bookID);
        logger.info("Book " + newItem.bookID + " successfully added to cart for user: " + newItem.buyer, {service: "Server"});
        result(null, res);
    });    
}

exports.get = function(params, result){
    let query_start = new Date().getTime();
    mysql.query(`SELECT * FROM carts WHERE buyer = "${params}"`, (err, res) => {
        if (err) {
          logger.error("Cart items cannot be retrieved for user: " + params, {service: "Server"});
          console.log("error: ", err);
          result(err, null);
          return;
        }
        let query_end = new Date().getTime();
        sdc.timing("Query-Get", query_end-query_start);
        logger.info("Cart item successfully retrieved for user: " + params, {service: "Server"});
        result(null, res);
    });
}

exports.remove = function(params, result){
    let query_start = new Date().getTime();
    mysql.query(`DELETE FROM carts WHERE bookID = ${params.bookID} AND buyer = "${params.buyer}";`, (err, res) => {
        if (err) {
          logger.error("Cart item successfully removed " + params.bookID, {service: "Server"});
          console.log("error: ", err);
          result(err, null);
          return;
        }
        let query_end = new Date().getTime();
        sdc.timing("Query-Delete", query_end-query_start);
        logger.info("Cart items successfully removed: " + params.bookID, {service: "Server"});
        result(null, res);
    });    
}