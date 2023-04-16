var connection=require('./service/connection')
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
var path = require("path");

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

//backend running port
const port = 5000;


//test endpoint
app.get('/', function (req, res) {
  res.send('Hello World!');
});
app.use(cors());
app.listen(port, function () {
  console.log('Example app listening on port 5000!');
});


//get bus owner registration details from database
app.get("/userInfo", (req, res) => {
  var q= "SELECT * FROM fastmove.BusOwner_Registration;";
  connection.query(q, (err, data) => {
    if (err) return res.json(err);
    return res.json(data);
  });
});


//get bus Bus registration details from database
app.get("/busDetails", (req, res) => {
  var p= "SELECT * FROM fastmove.Bus_Registration;";
  connection.query(p, (err, data) => {
    if (err) return res.json(err);
    return res.json(data);
  });
});

// var axios = require("axios").default;

// var options = {
//   method: 'GET',
//   url: 'https://{yourDomain}/api/v2/users',
//   params: {q: 'email:"jane@exampleco.com"', search_engine: 'v3'},
//   headers: {authorization: 'Bearer {yourMgmtApiAccessToken}'}
// };

// axios.request(options).then(function (response) {
//   console.log(response.data);
// }).catch(function (error) {
//   console.error(error);
// });


//register new bus from frontend and send data to database
app.post("/addBus", (req, res) => {
  const q = "INSERT INTO Bus_Registration(`Bus_No`,`Bus_type`,`No_ofSeats`,`Bus_Lisence_startDate`,`Bus_Lisence_expireDate`) VALUES (?)";
    const startDate = req.body.Bus_Lisence_startDate;
  const expireDate = new Date(startDate); //calculate end date after one year from registered date
  expireDate.setMonth(expireDate.getMonth() + 12);
  
  const values = [
    req.body.Bus_No,
    req.body.Bus_type,
    req.body.No_ofSeats,
    req.body.Bus_Lisence_startDate,
    expireDate.toISOString().slice(0, 19).replace('T', ' '),// Convert date to MySQL datetime format
  ];
  connection.query(q,[values], (err, data) => {
    if (err) return res.json(err);
    return res.json("bus has been added successfully");
  });
  console.log(values)
});


//get inquiries from bus owner
app.post("/submit-inquiry", (req, res) => {
  const s = "INSERT INTO inquiry_bus_owner(`type_of_issue`,`complain`) VALUES (?)";  
  const values = [
    req.body.type_of_issue,
    req.body.complain,
  ];
  connection.query(s,[values], (err, data) => {
    if (err) return res.json(err);
    return res.json("Inquiry is submitted successfully");
  });
  console.log(values)
});

app.post('/api/users', (req, res) => {
  const { email, name, picture } = req.body;
  const id = uuidv4();
  const insertQuery = 'INSERT INTO users (id, email, name, picture) VALUES (?, ?, ?, ?)';
  connection.query(insertQuery, [id, email, name, picture], (error, results, fields) => {
    if (error) {
      console.error('Error saving user details to database:', error);
      res.status(500).json({ error: 'Unable to save user details' });
    } else {
      console.log('User details saved to database:', results);
      res.json({ success: true });
    }
  });
});