const mysql = require("mysql");
const dbconfig = require("./config/dbconfig.js");
const logger = require("./winston.js");
const { findByEmail } = require("./services/userServices.js");

var connection = mysql.createConnection({
  host: dbconfig.HOST,
  user: dbconfig.USER,
  password: dbconfig.PASSWORD,
  database: dbconfig.DB,
  ssl: 'Amazon RDS'
});

connection.connect(function (err) {
  if (err) throw err;
  logger.info("Successfully connected to the database", { service: "Database" });

  var usertable = "CREATE TABLE IF NOT EXISTS `users` (" +
    "`firstname` varchar(20) DEFAULT NULL," +
    "`lastname` varchar(20) DEFAULT NULL," +
    "`email` varchar(40) NOT NULL," +
    "`password_salt` binary(60) DEFAULT NULL," +
    "PRIMARY KEY (`email`)" +
    ") ENGINE=InnoDB DEFAULT CHARSET=latin1;"
  connection.query(usertable, function (err, result) {
    if (err) throw err;
    logger.info("User Table created!", { service: "Database" });

  });

  var booktable = "CREATE TABLE IF NOT EXISTS `books` (" +
    "`id` int(11) NOT NULL AUTO_INCREMENT," +
    "`title` varchar(255) DEFAULT NULL," +
    "`authors` text," +
    "`ISBN` text," +
    "`publication_date` date DEFAULT NULL," +
    "`quantity` int(11) DEFAULT NULL," +
    "`price` double DEFAULT NULL," +
    "`owner` varchar(40) NOT NULL," +
    "`image_names` text NOT NULL," +
    "`created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP," +
    "`updated` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP," +
    "PRIMARY KEY (`id`)," +
    "KEY `owner` (`owner`)," +
    "CONSTRAINT `books_ibfk_1` FOREIGN KEY (`owner`) REFERENCES `users` (`email`) ON DELETE CASCADE ON UPDATE CASCADE" +
    ") ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=latin1;"
  connection.query(booktable, function (err, result) {
    if (err) throw err;
    logger.info("Book Table created!", { service: "Database" });
  });

  var carttable = "CREATE TABLE IF NOT EXISTS `carts` (" +
    "  `bookID` int(11) NOT NULL," +
    "`buyer` varchar(40) NOT NULL," +
    "KEY `bookID` (`bookID`)," +
    "CONSTRAINT `carts_ibfk_1` FOREIGN KEY (`bookID`) REFERENCES `books` (`id`) ON DELETE CASCADE" +
    ") ENGINE=InnoDB DEFAULT CHARSET=latin1;"
  connection.query(carttable, function (err, result) {
    if (err) throw err;
    logger.info("Cart Table created!", { service: "Database" });
  });

  // Add a test user John 
  connection.query("INSERT INTO users (firstname, lastname, email, password_salt) SELECT 'John', 'Doe', 'john@email.com', '$2a$10$u8vuoxkWn47DH6KiuOgcJujKj.u4YY78zRWRpIZP4mDuELglnsEUu' WHERE NOT EXISTS ( SELECT email from users WHERE email = 'john@email.com');", function (err, result) {
    if (err) throw err;
    logger.info("Demo user inserted!", { service: "Database" });
  });
});

module.exports = connection;