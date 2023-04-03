var express = require('express');
var connection=require('./service/connection')
var app = express(),
port=process.env.PORT||5000,
cors=require("cors");
const mysql=require("mysql");
const bodyParser=require('body-parser');
app.use(cors());
app.use(express.json);

app.get('/', function (req, res) {
  res.send('Loaded!');
});
app.use(cors());
app.listen(port,function(){
  console.log('Example app listening on port 5000!');
});

app.get("/userInfo",(req,res)=>{
  var q="SELECT * FROM main.BusOwner_Registration;";
  connection.query(q,(err,data)=>{
    if (err) return res.json(err);
    return res.json(data);
  });
});

app.get("/busDetails",(req,res)=>{
  var p="SELECT * FROM main.Bus_Registration;";
  connection.query(p,(err,data)=>{
    if (err) return res.json(err);
    return res.json(data);
  });
});

var axios=require("axios").default;

var options={
  method:'GET',
  url: 'https://{yourDomain}/api/v2/users',
  params: {q: 'email:"jane@exampleco.com"', search_engine: 'v3'},
  headers: {authorization: 'Bearer {yourMgmtApiAccessToken}'}
};

 axios.request(options).then(function (response) {
   console.log(response.data);
 }).catch(function (error) {
   console.error(error);
 });

 app.post("/addBus",(req,res)=>{
  const q="INSERT INTO Bus_Registration(`Bus_No`,`Bus_type`,`No_ofSeats`,`Bus_Lisence_startDate`) VALUES (?)";

  const values=[
    req.body.BusNo,
    req.body.BusType,
    req.body.NumOfSeats,
    req.body.LisenceRenewDate,
  ];
  connection.query(q,[values],(err,data)=>{
    if (err) return res.json(err);
    return res.json("bus has been added successfully")
  });
 });

