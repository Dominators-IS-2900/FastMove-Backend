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
// Get all journeys
app.get('/journey', (req, res) => {
    const sql = "SELECT * FROM fastmove.journey";
    db.query(sql, (err, result) => {
      if (err) {
        console.log(err);
        res.status(500).send('Server error');
        return;
      }
      res.status(200).json(result);
    });
  });
  
  // Add a new journey
  app.post('/journeys', (req, res) => {
    const { journey_id, bus_no, route_id, income } = req.body;
    const sql = 'INSERT INTO journey (journey_id, bus_no, route_id, income) VALUES (?, ?, ?, ?)';
    db.query(sql, [journey_id, bus_no, route_id, income], (err, result) => {
      if (err) {
        console.log(err);
        res.status(500).send('Server error');
        return;
      }
      res.status(201).send('Journey added successfully');
    });
  });
  
  // Update a journey
  app.put('/journeys/:journey_id', (req, res) => {
    const { bus_no, route_id, income } = req.body;
    const { journey_id } = req.params;
    const sql = 'UPDATE journey SET bus_no = ?, route_id = ?, income = ? WHERE journey_id = ?';
    db.query(sql, [bus_no, route_id, income, journey_id], (err, result) => {
      if (err) {
        console.log(err);
        res.status(500).send('Server error');
        return;
      }
      res.status(200).send('Journey updated successfully');
    });
  });
  
  // Delete a jouerney
  app.delete('/journeys/:journey_id', (req, res) => {
    const { journey_id } = req.params;
    const sql = 'DELETE FROM journey WHERE journey_id = ?';
    db.query(sql, [journey_id], (err, result) => {
      if (err) {
        console.log(err);
        res.status(500).send('Server error');
        return;
      }
      res.status(200).send('Journey deleted successfully');
    });
  });
  // Retrieve all conductors
app.get('/api/conductors', (req, res) => {
    pool.query('SELECT * FROM conductor', (err, rows) => {
      if (err) {
        console.error(err);
        res.status(500).send('Internal server error');
      } else {
        res.json(rows);
      }
    });
  });
  
  // Retrieve a specific conductor by ID
  app.get('/api/conductors/:id', (req, res) => {
    const { id } = req.params;
    pool.query('SELECT * FROM conductor WHERE conductor_id = ?', [id], (err, rows) => {
      if (err) {
        console.error(err);
        res.status(500).send('Internal server error');
      } else if (rows.length === 0) {
        res.status(404).send('Conductor not found');
      } else {
        res.json(rows[0]);
      }
    });
  });
  
  // Create a new conductor
  app.post('/api/conductors', (req, res) => {
    const { username, password, nic, phone_number, email } = req.body;
    pool.query('INSERT INTO conductor (username, password, nic, phone_number, email) VALUES (?, ?, ?, ?, ?)', [username, password, nic, phone_number, email], (err, result) => {
      if (err) {
        console.error(err);
        res.status(500).send('Internal server error');
      } else {
        const newConductor = {
          conductor_id: result.insertId,
          username,
          password,
          nic,
          phone_number,
          email
        };
        res.status(201).json(newConductor);
      }
    });
  });
  
  // Update an existing conductor
  app.put('/api/conductors/:id', (req, res) => {
    const { id } = req.params;
    const { username, password, nic, phone_number, email } = req.body;
    pool.query('UPDATE conductor SET username = ?, password = ?, nic = ?, phone_number = ?, email = ? WHERE conductor_id = ?', [username, password, nic, phone_number, email, id], (err, result) => {
      if (err) {
        console.error(err);
        res.status(500).send('Internal server error');
      } else if (result.affectedRows === 0) {
        res.status(404).send('Conductor not found');
      } else {
        res.status(200).send('Conductor updated successfully');
      }
    });
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
