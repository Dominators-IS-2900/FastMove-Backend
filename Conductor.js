const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const app = express();
const port = process.env.PORT || 6000;

// Create a MySQL connection pool
const pool = mysql.createPool({
  connectionLimit: 10,
  host: 'fastmove-db.ct3qzhwiht7m.ap-southeast-2.rds.amazonaws.com',
    user: 'admin',
    password: 'FastmoveIN2900',
    database: 'fastmove'
});

// Use body-parser middleware to parse request bodies
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

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


