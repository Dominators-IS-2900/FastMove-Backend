const express = require('express');
const mysql = require('mysql2/promise');

// Create a new Express application
const app = express();

// Set up middleware to parse request body as JSON
app.use(express.json());

// Set up a route to handle form submission
app.post('/updateConductor', async (req, res) => {
  try {
    // Extract conductor information from request body
    const { cname, nic, pnumber, age, email } = req.body;

    // Create a new MySQL connection
    const connection = await mysql.createConnection({
      host: 'fastmove-db.ct3qzhwiht7m.ap-southeast-2.rds.amazonaws.com',
      user: 'admin',
      password: 'FastmoveIN2900',
      database: 'fastmov',
    });

    // Update conductor information in database
    const [result] = await connection.query(
      'UPDATE conductor SET username=?, nic=?, password=?, bus_no=?,phone_number=?, email=? WHERE id=?',
      [username, nic, password, bus_no,phone_number, email]
    );

    // Close MySQL connection
    connection.end();

    // Return success message
    res.json({ success: true, message: 'Conductor information updated successfully.' });
  } catch (error) {
    console.error(error);

    // Return error message
    res.status(500).json({ success: false, message: 'An error occurred while updating conductor information.' });
  }
});

// Start the server
app.listen(3000, () => console.log('Server started on port 3000.'));
const mysql = require('mysql2');


// function to handle POST requests to update conductor information
const conductor= (req, res) => {
  const { username, password, nic, phone_number, email, bus_no } = req.body;

  // Get all conductor details
  app.get('/conductor', (req, res) => {
    const sql = 'SELECT * FROM conductor';
    pool.query(sql, (err, result) => {
      if (err) {
        console.log(err);
        res.status(500).send('Server error');
        return;
      }
      res.status(200).json(result);
    });
  });


  // UPDATE the new conductor information into the database
  pool.query(
    'UPDATE INTO conductor (username, password, nic, phone_number, email, bus_no) VALUES (?, ?, ?, ?, ?, ?)',
    [ username, password, nic, phone_number, email, bus_no ],
    (err, results) => {
      if (err) {
        console.error(err);
        res.status(500).send('Error inserting new conductor information into database');
      } else {
        console.log('New conductor information inserted into database');
        res.status(200).send('Conductor information updated successfully');
      }
    }
  );
};


// set up your Express app and routes
const express = require('express');


// parse JSON request bodies
app.use(express.json());

// handle POST requests to update conductor information
app.post('/api/conductor/update', conductor);



// start the server
const port = 6000;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
