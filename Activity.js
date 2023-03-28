const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = 3000;

const db = mysql.createConnection({
  host: 'http://fastmove-db.ct3qzhwiht7m.ap-southeast-2.rds.amazonaws.com/',
  user: 'admin',
  password: 'FastmoveIN2900',
  database: 'fastmove'
});

db.connect((err) => {
  if (err) {
    console.log(err);
    return;
  }
  console.log('Connected to MySQL database.');
});

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

// Get all journeys
app.get('/journeys', (req, res) => {
  const sql = 'SELECT * FROM journey';
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

app.listen(port, () => {
  console.log(`Server listening on port ${port}.`);
});
