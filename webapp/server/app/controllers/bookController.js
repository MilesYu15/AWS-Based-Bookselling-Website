'use strict';

//Import specific operations to database
const userService = require('../services/userServices');
const bookService = require('../services/bookServices');
const multer = require('multer');
const fs = require('fs');

exports.upload = multer();

const Book = function(params){
    this.title = params.title;
    this.authors = params.authors;
    this.ISBN = params.ISBN;
    this.publication_date = params.publication_date;
    this.quantity = params.quantity;
    this.price = params.price;
    this.owner = params.owner;
}

exports.test = function(req, res){
    console.log("!!!!!!");
    console.log(req.body);
    let book = new Book(req.body);
    console.log(req.files);
    console.log(book);

    res.status(300).send();
    
}

//Register a new user
exports.add = function(req, res){

    bookService.addBook(req, (err, data) => {
        if (err) {
            res.status(500).send(err);
        } 
        else 
            res.status(200).send(data);
    });

}

exports.update = function(req, res){

    bookService.update(req.body, (err, data) => {
        if (err) {
          res.status(500).send(err);
        } 
        else {
          res.status(200).json(data);
        };
    });
}

exports.getAllBooks = function(req, res){
    bookService.getAll(req.body, (err, data) => {
        if (err) {
            res.status(500).send(err);
          } 
        else {
            res.status(200).json(data);
        };
    });
}

exports.getUserBooks = function(req, res){
    bookService.seachByOwner(req.params.email, (err, data) => {
        if (err) {
            res.status(500).send(err);
        } 
        else {
            res.status(200).json(data);
        };
    });
}

exports.serveImages = function(req, res){
    const filename = req.params.filename;
    let filePath = __dirname + "/../../downloads/" + filename;
    fs.readFile(filePath, function(err, data){
        if(err) {
            res.writeHead(404);
            res.end(JSON.stringify(err));
            return;
        }

        else {
            res.writeHead(200);
            //res.setHeader('Content-Type', 'text/html');
            res.end(data);
        }
    })
}

exports.getCartBooks = function(req, res){

}

exports.getABook = function(req, res){
    bookService.searchByID(req.params.id, (err, data) => {
        if (err) {
            res.status(500).send(err);
        } 
        else {
            res.status(200).json(data)
        };
    });
}

exports.deleteABook = function(req, res){
    bookService.deleteByID(req.params.id, (err, data) => {
        if (err) {
            res.status(500).send(err);
        } 
        else {
            res.status(200).json(data)
        };
    });
}

// exports.search = function(req, res){
//     userService.findByEmail(req.params.email, (err, data) => {
//         if (err) {
//           if (err.kind === "not_found") {
//             res.status(404).send({
//               message: `Not found Customer with id ${req.params.email}.`
//             });
//           } else {
//             res.status(500).send({
//               message: "Error retrieving Customer with id " + req.params.email
//             });
//           }
//         } else res.send(data);
//     });
// }

// //Authenticate an user for with password
// exports.authenticate = function(req, res, next){
//     userService.authenticate(req.body, (err, data) => {
//         if (err) {
//           res.status(500).send(err);
//         } else {
//           res.status(200).json(data);
//         }
//     });
// }

// exports.update = function(req, res){
//     console.log(req.body);

//     userService.update(req.body, (err, data) => {
//         if (err) {
//           res.status(500).send(err);

//         } 
//         else {
//           res.status(200).json(data)
//         };
//     });
// }