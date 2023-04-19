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

