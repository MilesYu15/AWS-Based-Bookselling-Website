'use strict';
const config = require('../config');
const mysql = require('../mysql.js');
const AWS = require('aws-sdk');
const fs = require('fs');
const logger = require('../winston.js');
const sdc = require('../statsd.js');
const shortid = require('shortid');
const { query } = require('../winston.js');

const Book = function (params) {
  this.title = params.title;
  this.authors = params.authors;
  this.ISBN = params.ISBN;
  this.publication_date = params.publication_date;
  this.quantity = params.quantity;
  this.price = params.price;
  this.owner = params.owner;
}

exports.addBook = function (req, result) {
  let bookImages = "";

  var newBook = new Book(req.body);
  for (let file of req.files) {
    let extension = file.originalname.split('.')[1];
    file.originalname = shortid.generate() + "." + extension;
    bookImages = bookImages.concat(file.originalname + "||");
  }

  /**
   * Send files to S3
   */
  const s3 = new AWS.S3({
    region: config.aws_region
  })

  const imageFiles = req.files;
  let start_time = new Date().getTime();
  imageFiles.map((item) => {
    var params = {
      Bucket: config.aws_S3_bucket,
      Key: item.originalname,
      Body: item.buffer,
      ACL: 'public-read'
    };

    s3.upload(params, function (err, data) {
      if (err) {
        logger.error("Book cannot be uploaded to S3 bucket: " + params.Key, { service: "Server" });
        console.log(err);
      }
      let end_time = new Date().getTime();
      sdc.timing("S3-BookImage-Upload", end_time - start_time);
      logger.info("Book successfully uploaded to S3 bucket: " + params.Key, { service: "Server" });
    });
  });

  newBook.image_names = bookImages;

  /**
   * Insert the book into Database
   */
  let query_start = new Date().getTime();
  mysql.query("INSERT INTO books SET ?", newBook, (err, res) => {
    if (err) {
      logger.error("Book cannot be inserted into database: " + newBook.title, { service: "Server" });
      console.log("error: ", err);
      result(err, null);
      return;
    }
    let query_end = new Date().getTime();
    sdc.timing("Query-Insert", query_end - query_start);
    logger.info("Book successfully inserted into database: " + newBook.title, { service: "Server" });
    result(null, res);
  });
}

exports.update = function (params, result) {

  let query_start = new Date().getTime();
  mysql.query(`SELECT * FROM books WHERE id = ${params.id};`, (err, res) => {
    if (err) {
      logger.error("Book cannot be found in update process: " + params.id, { service: "Server" });
      console.log("error: ", err);
      return;
    }
    let query_end = new Date().getTime();
    sdc.timing("Query-Get", query_end - query_start);
    var original_tokens = res[0].image_names.split("||");
    var incoming_tokens = params.image_names.split("||");
    var deleted_tokens = [];

    //For deletion only
    for (let token of original_tokens) {
      if (!incoming_tokens.includes(token)) {
        deleted_tokens.push(token);
      }
    }

    const s3 = new AWS.S3({
      region: config.aws_region
    });
    let start_time = new Date().getTime();
    deleted_tokens.map((item) => {
      var params = {
        Bucket: config.aws_S3_bucket,
        Key: item
      };

      s3.deleteObject(params, function (err, data) {
        if (err) {
          logger.error("Book image cannot be removed from S3 bucket " + params.Key, { service: "Server" });
          console.log(err);
        }
        let end_time = new Date().getTime();
        sdc.timing("S3-BookImage-Delete", end_time - start_time);
        logger.info("Book image successfully removed from S3 bucket: " + params.Key, { service: "Server" });
      });
    });


    let query_start2 = new Date().getTime();
    mysql.query("UPDATE books SET title = ?, authors = ?, ISBN = ?, publication_date = ?, quantity = ?, price = ?, image_names = ? WHERE id = ?",
      [params.title, params.authors, params.ISBN, params.publication_date, params.quantity, params.price, params.image_names, params.id], (err, res) => {

        if (err) {
          logger.error("Book cannot be updated in the update process: " + params.id, { service: "Server" });
          console.log("error: ", err);
          result(err, null);
          return;
        }

        if (res.affectedRows == 0) {
          logger.error("Book cannot be found in secondary update process: " + params.id, { service: "Server" });
          result({ code: "ER_BOOK_NOMATCH" }, null);
          return;
        }

        let query_end2 = new Date().getTime();
        sdc.timing("Query-Update", query_end2 - query_start2);
        logger.info("Book successfully updated: " + params.id, { service: "Server" });
        result(null, { message: "Book updated" });
      });
  });


}

exports.seachByOwner = function (params, result) {
  var allFileNames = [];

  /**
   * Get objects from AWS
   * 
   */
  const s3 = new AWS.S3({
    region: config.aws_region
  });

  let query_start = new Date().getTime();
  mysql.query(`SELECT * FROM books WHERE owner = "${params}"`, (err, res) => {
    if (err) {
      logger.error("Books cannot be retrieved for user: " + params, { service: "Server" });
      console.log("error: ", err);
      result(err, null);
      return;
    }

    let query_end = new Date().getTime();
    sdc.timing("Query-Get", query_end - query_start);

    for (let book of res) {
      let tokens = book.image_names.split("||");
      for (let i = 0; i < tokens.length - 1; i++)
        allFileNames.push(tokens[i]);
    }

    var callRemaining = allFileNames.length;
    let start_time = new Date().getTime();
    for (let bookName of allFileNames) {
      var file = fs.createWriteStream('/home/ubuntu/server/downloads/' + bookName);
      var aws_params = {
        Bucket: config.aws_S3_bucket,
        Key: bookName
      }
      s3.getObject(aws_params).createReadStream().on('end', () => {
        --callRemaining;
        let end_time = new Date().getTime();
        sdc.timing("S3-BookImage-Download", end_time - start_time);
        if (callRemaining <= 0) {
          logger.info("Book images successfully retrieved from S3 bucket for user", { service: "Server" });
          logger.info("Books successfully found in the database for user: " + params, { service: "Server" });
          result(null, res);
        }
      }).pipe(file);
    }

  });
}

exports.getAll = function (params, result) {
  var allFileNames = [];

  /**
   * Getting book images from S3
   */
  const s3 = new AWS.S3({
    region: config.aws_region
  });

  let query_start = new Date().getTime();
  mysql.query(`SELECT * FROM books WHERE quantity != 0;`, (err, res) => {
    if (err) {
      logger.error("Books cannot be retrieved from database: ", { service: "Server" });
      console.log("error: ", err);
      result(err, null);
      return;
    }

    let query_end = new Date().getTime();
    sdc.timing("Query-Get", query_end - query_start);

    for (let book of res) {
      let tokens = book.image_names.split("||");
      for (let i = 0; i < tokens.length - 1; i++)
        allFileNames.push(tokens[i]);

      //Increment book view times
      sdc.increment("Book-View-" + book.title);
    }

    var callRemaining = allFileNames.length;
    let start_time = new Date().getTime();
    for (let bookName of allFileNames) {
      var file = fs.createWriteStream('/home/ubuntu/server/downloads/' + bookName);
      var aws_params = {
        Bucket: config.aws_S3_bucket,
        Key: bookName
      }
      s3.getObject(aws_params).createReadStream().on('end', () => {
        --callRemaining;
        let end_time = new Date().getTime();
        sdc.timing("S3-BookImage-Download", end_time - start_time);
        if (callRemaining <= 0) {
          logger.info("Book images successfully retrieved from S3 bucket", { service: "Server" });
          logger.info("All books successfully found in the database", { service: "Server" });
          result(null, res);
        }
      }).pipe(file);
    }

  });
}

exports.searchByID = function (params, result) {
  let query_start = new Date().getTime();
  mysql.query(`SELECT * FROM books WHERE id = ${params};`, (err, res) => {
    if (err) {
      logger.error("Book cannot be found in the database: " + params, { service: "Server" });
      console.log("error: ", err);
      result(err, null);
      return;
    }

    let query_end = new Date().getTime();
    sdc.timing("Query-Get", query_end - query_start);
    logger.info("Book successfully found in the database: " + params, { service: "Server" });
    result(null, res);
  });
}

exports.deleteByID = function (params, result) {
  let query_start = new Date().getTime();
  mysql.query(`SELECT * FROM books WHERE id = ${params};`, (err, res) => {
    if (err) {
      logger.error("Book cannot be found in database: " + params, { service: "Server" });
      console.log("error: ", err);
      return;
    };

    let query_end = new Date().getTime();
    sdc.timing("Query-Get", query_end - query_start);

    var original_tokens = res[0].image_names.split("||");
    const s3 = new AWS.S3({
      region: config.aws_region
    });

    let start_time = new Date().getTime();
    original_tokens.filter(function (item) {
      if (item == "")
        return false;
      else
        return true;
    }).map((item) => {
      var params = {
        Bucket: config.aws_S3_bucket,
        Key: item
      };

      s3.deleteObject(params, function (err, data) {
        if (err) {
          logger.error("Book images cannot be removed from S3 bucket", { service: "Server" });
          console.log(err);
        }
        let end_time = new Date().getTime();
        sdc.timing("S3-BookImage-Delete", end_time - start_time);
        logger.info("Book images successfully removed from S3 bucket", { service: "Server" });
      });
    });

    let query_start2 = new Date().getTime();
    mysql.query(`DELETE FROM books WHERE id = ${params};`, (err, res) => {
      if (err) {
        logger.error("Book cannot be deleted from database: " + params, { service: "Server" });
        console.log("error: ", err);
        result(err, null);
        return;
      }
      let query_end2 = new Date().getTime();
      sdc.timing("Query-Delete", query_end2 - query_start2);

      logger.info("Book successfully deleted from database: " + params, { service: "Server" });
      result(null, res);
    });
  });
}