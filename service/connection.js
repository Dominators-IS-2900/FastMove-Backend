var mysql=require('mysql');

var connection=mysql.createConnection({
    host:"fastmove-db.ct3qzhwiht7m.ap-southeast-2.rds.amazonaws.com",
    user:"admin",
    password:"FastmoveIN2900",
    database:"fastmove",
});
connection.connect(function(err){
    if (err)throw err;
    console.log("connected to database")
});

module.exports=connection