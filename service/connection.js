//data base configuration
var mysql = require('mysql');

var connection = mysql.createConnection({
  host: "fastmove.cyltlmrg7fka.ap-southeast-2.rds.amazonaws.com",
  user: "admin",
  password: "Fastmove1234",
  database: "fastmove",
});
connection.connect(function(err) {
    if (err) throw err;
    console.log("connected to database")
  });

module.exports = connection
