const express = require('express');
const mysql = require('mysql');

const app = express();

// Create connection to MySQL database
const connection = mysql.createConnection({
    host: 'fastmove-db.ct3qzhwiht7m.ap-southeast-2.rds.amazonaws.com',
    user: 'admin',
    password: 'FastmoveIN2900',
    database: 'fastmove'
});

// Connect to MySQL database
connection.connect((err) => {
  if (err) throw err;
  console.log('Connected to MySQL database');
});

// API endpoint for fetching all bus fares
app.get('/bus-fares', (req, res) => {
  const sql = 'SELECT * FROM fare_table';
  connection.query(sql, (err, results) => {
    if (err) throw err;
    res.send(results);
  });
});

// API endpoint for fetching a single bus fare by start and end points
app.get('/bus-fares/:start/:end', (req, res) => {
  const sql = `SELECT * FROM fare_table WHERE start_point = '${req.params.start}' AND end_point = '${req.params.end}'`;
  connection.query(sql, (err, results) => {
    if (err) throw err;
    res.send(results[0]);
  });
});

// API endpoint for adding a new bus fare
app.post('/bus-fares', (req, res) => {
  const { start_point, end_point, distance, price } = req.body;
  const sql = `INSERT INTO fare_table (start_point, end_point, distance, price) VALUES ('${start_point}', '${end_point}', ${distance}, ${price})`;
  connection.query(sql, (err, result) => {
    if (err) throw err;
    res.send('Bus fare added successfully');
  });
});

// API endpoint for updating an existing bus fare by start and end points
app.put('/bus-fares/:start/:end', (req, res) => {
  const { distance, price } = req.body;
  const sql = `UPDATE fare_table SET distance = ${distance}, price = ${price} WHERE start_point = '${req.params.start}' AND end_point = '${req.params.end}'`;
  connection.query(sql, (err, result) => {
    if (err) throw err;
    res.send('Bus fare updated successfully');
  });
});

// API endpoint for deleting an existing bus fare by start and end points
app.delete('/bus-fares/:start/:end', (req, res) => {
  const sql = `DELETE FROM fare_table WHERE start_point = '${req.params.start}' AND end_point = '${req.params.end}'`;
  connection.query(sql, (err, result) => {
    if (err) throw err;
    res.send('Bus fare deleted successfully');
  });
});

const port = 6000;
app.listen(port, () => console.log(`Server running on port ${port}`));
