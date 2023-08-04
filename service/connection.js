// //data base configuration
// var mysql = require('mysql');

// var connection = mysql.createConnection({
//   host: "fastmove.cyltlmrg7fka.ap-southeast-2.rds.amazonaws.com",
//   user: "admin",
//   password: "Fastmove1234",
//   database: "fastmove",
// });
// connection.connect(function(err) {
//     if (err) throw err;
//     console.log("connected to database")
//   });

// module.exports = connection

// Import the 'mysql' module
var mysql = require('mysql');

// Create a connection to a MySQL database
var connection = mysql.createConnection({
  host: "fastmove.mysql.database.azure.com",
  user: "fastmovedb",
  password: "Dominators123",
  database: "fastmove",
});

// Attempt to connect to the database
connection.connect(function(err) {
  if (err) throw err;
  console.log("connected to database");
});

// Export the 'connection' object so that it can be used by other modules
module.exports = connection;
