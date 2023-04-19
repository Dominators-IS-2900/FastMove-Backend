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

 var axios = require("axios").default;

var options = {
   method: 'GET',
   url: 'https://{yourDomain}/api/v2/users',
   params: {q: 'email:"jane@exampleco.com"', search_engine: 'v3'},
   headers: {authorization: 'Bearer {yourMgmtApiAccessToken}'}
 };

 axios.request(options).then(function (response) {
   console.log(response.data);
 }).catch(function (error) {
   console.error(error);
 });


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

app.use(bodyParser.json());
// get all journeys
app.get('/journeys', (req, res) => {
  pool.query('SELECT * FROM journey', (error, results) => {
    if (error) throw error;
    res.send(results);
  });
});

// get journey by ID
app.get('/journeys/:id', (req, res) => {
  const id = req.params.id;
  pool.query('SELECT * FROM journey WHERE journey_id = ?', id, (error, results) => {
    if (error) throw error;
    if (results.length === 0) {
      res.status(404).send('Journey not found');
    } else {
      res.send(results[0]);
    }
  });
});

// create new journey
app.post('/journeys', (req, res) => {
  const { journey_id, bus_no, route_id, income } = req.body;
  pool.query('INSERT INTO journey SET ?', { journey_id, bus_no, route_id, income }, (error, results) => {
    if (error) throw error;
    res.status(201).send(`Journey ${journey_id} created successfully`);
  });
});

// update journey by ID
app.put('/journeys/:id', (req, res) => {
  const id = req.params.id;
  const { bus_no, route_id, income } = req.body;
  pool.query('UPDATE journey SET bus_no = ?, route_id = ?, income = ? WHERE journey_id = ?', [bus_no, route_id, income, id], (error, results) => {
    if (error) throw error;
    if (results.affectedRows === 0) {
      res.status(404).send('Journey not found');
    } else {
      res.send(`Journey ${id} updated successfully`);
    }
  });
});

// delete journey by ID
app.delete('/journeys/:id', (req, res) => {
  const id = req.params.id;
  pool.query('DELETE FROM journey WHERE journey_id = ?', id, (error, results) => {
    if (error) throw error;
    if (results.affectedRows === 0) {
      res.status(404).send('Journey not found');
    } else {
      res.send(`Journey ${id} deleted successfully`);
    }
  });
});
// Get bus fares
app.get('/bus_fares', (req, res) => {
  pool.query(
    'SELECT r.route_id, r.start_point, r.end_point, ' +
    'CASE ' +
    '  WHEN r.distance <= 5 THEN (SELECT price FROM fare_rates WHERE distance=5) ' +
    '  ELSE (SELECT price FROM fare_rates WHERE distance=5) + ' +
    '       (ROUND(r.distance / 5) - 1) * ' +
    '       (SELECT price FROM fare_rates WHERE distance=10) ' +
    'END AS bus_fare ' +
    'FROM routes r',
    (error, results) => {
      if (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
      } else {
        res.status(200).json(results);
      }
    }
  );
});

// Update fare rates based on admin inputs
app.put('/fare_rates/:fare_rate_id', (req, res) => {
  const fareRateId = req.params.fare_rate_id;
  const { min_price, add_amount } = req.body;
  pool.query(
    'UPDATE fare_rates ' +
    'SET min_price = ?, add_amount = ? ' +
    'WHERE fare_rate_id = ?',
    [min_price, add_amount, fareRateId],
    (error, results) => {
      if (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
      } else if (results.affectedRows === 0) {
        res.status(404).send('Fare rate not found');
      } else {
        res.status(200).send('Fare rate updated successfully');
      }
    }
  );
});
// Get all profiles
app.get('/profiles', (req, res) => {
  const sql = 'SELECT * FROM conductor_profiles';
  db.query(sql, (err, result) => {
    if (err) throw err;
    res.send(result);
  });
});

// Get a profile by ID
app.get('/profiles/:id', (req, res) => {
  const id = req.params.id;
  const sql = 'SELECT * FROM conductor_profiles WHERE conductor_id = ?';
  db.query(sql, [id], (err, result) => {
    if (err) throw err;
    res.send(result[0]);
  });
});

// Create a new profile
app.post('/profiles', (req, res) => {
  const { conductor_id, user_name, password, mobile_number, email, nic_scan_copy } = req.body;
  const sql = 'INSERT INTO conductor_profiles (conductor_id, user_name, password, mobile_number, email, nic_scan_copy) VALUES (?, ?, ?, ?, ?, ?)';
  db.query(sql, [conductor_id, user_name, password, mobile_number, email, nic_scan_copy], (err, result) => {
    if (err) throw err;
    res.send('Profile created successfully!');
  });
});

// Update a profile
app.put('/profiles/:id', (req, res) => {
  const id = req.params.id;
  const { user_name, password, mobile_number, email, nic_scan_copy } = req.body;
  const sql = 'UPDATE conductor_profiles SET user_name = ?, password = ?, mobile_number = ?, email = ?, nic_scan_copy = ? WHERE conductor_id = ?';
  db.query(sql, [user_name, password, mobile_number, email, nic_scan_copy, id], (err, result) => {
    if (err) throw err;
    res.send('Profile updated successfully!');
  });
});

// Delete a profile
app.delete('/profiles/:id', (req, res) => {
  const id = req.params.id;
  const sql = 'DELETE FROM conductor_profiles WHERE conductor_id = ?';
  db.query(sql, [id], (err, result) => {
    if (err) throw err;
    res.send('Profile deleted successfully!');
  });
});
// handle POST request to submit form data
app.post('/submit-form', upload.single('nic_scan_copy'), (req, res) => {
  // extract form data from request body
  const { email, first_name, last_name, address, tp, account_no } = req.body;
  // extract file information from multer's file object
  const { originalname, filename } = req.file;

  // build SQL query to insert form data into database
  const sql = 'INSERT INTO passengers (email, first_name, last_name, address, tp, account_no, nic_scan_copy_name, nic_scan_copy_path) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
  const values = [email, first_name, last_name, address, tp, account_no, originalname, `uploads/${filename}`];

  // execute SQL query to insert form data into database
  connection.query(sql, values, (error, results, fields) => {
    if (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to insert data into database.' });
    } else {
      res.status(200).json({ message: 'Form data submitted successfully.' });
    }
  });
});
