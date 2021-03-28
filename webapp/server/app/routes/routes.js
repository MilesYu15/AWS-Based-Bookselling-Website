'use strict';

module.exports = function(app){
    const userController = require('../controllers/userController');
    const bookController = require('../controllers/bookController');
    const cartController = require('../controllers/cartController');
    const logController = require('../controllers/logController');

    app.route('/user/:email')
        .get(userController.search); //Fetch one user

    app.route('/user/authenticate')
        .post(userController.authenticate); // Log in an User

    app.route('/user/logout/:email')
        .delete(userController.logout);

    app.route('/user/update')
        .put(userController.update); // Log in an User

    app.route('/user/reset')
        .post(userController.reset); // Log in an User  
    
    app.route('/users/register')
        .post(userController.registerUser); // Register a user

    app.route('/user/testUpdate')
        .put(userController.testUpdate);

    app.route('/books/add')
        .post(bookController.upload.array("imageFile"), bookController.add);

    app.route('/book/update')
        .put(bookController.update);

    app.route('/books')
        .get(bookController.getAllBooks);

    app.route('/books/:email')
        .get(bookController.getUserBooks);

    app.route('/books/image/:filename')
        .get(bookController.serveImages);

    app.route('/books/cart')
        .get(bookController.getCartBooks);

    app.route('/book/:id')
        .get(bookController.getABook)
        .delete(bookController.deleteABook);

    app.route('/carts')
        .post(cartController.addToCart)
        .put(cartController.remove); //Remove a cart item

    app.route('/carts/:email')
        .get(cartController.getUserCarts);

    app.route('/books/test')
        .post(bookController.upload.array("imageFile"), bookController.test);

    app.route('/client/logs')
        .post(logController.clientLog);
};