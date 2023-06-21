const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
const connection = require('./service/connection');
const nodemailer = require('nodemailer');
const app = express();
const port = 5000;

// Configure Multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Specify the destination folder for storing uploaded files
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname); // Use the original filename for storing the uploaded file
  },
});
const upload = multer({ storage });

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Test endpoint
app.get('/', function (req, res) {
  res.send('Hello World!');
});

// Get bus owner registration details from database
app.get('/busOwnerRegistration', (req, res) => {
  const query = 'SELECT * FROM fastmove.BusOwner_Registration';
  connection.query(query, (err, data) => {
    if (err) {
      console.error('Error executing the query: ', err);
      return res.status(500).json({ error: 'An error occurred while fetching bus owner registration details' });
    }
    return res.json(data);
  });
});

// Get bus registration details from database
app.get('/busDetails', (req, res) => {
  const query = 'SELECT * FROM fastmove.Bus_Registration';
  connection.query(query, (err, data) => {
    if (err) {
      console.error('Error executing the query: ', err);
      return res.status(500).json({ error: 'An error occurred while fetching bus details' });
    }
    return res.json(data);
  });
});

// Register a new bus from frontend and save data to the database
app.post('/addBus', (req, res) => {
  const query =
    'INSERT INTO Bus_Registration (`Bus_No`, `Bus_type`, `No_ofSeats`, `Bus_Lisence_startDate`, `User_Email`) VALUES (?, ?, ?, ?, ?)';

  const values = [
    req.body.Bus_No,
    req.body.Bus_type,
    req.body.No_ofSeats,
    req.body.Bus_Lisence_startDate,
    req.body.User_Email,
  ];

  connection.query(query, values, (err) => {
    if (err) {
      console.error('Error executing the query: ', err);
      return res.status(500).json({ error: 'An error occurred while adding the bus' });
    }
    return res.json('Bus has been added successfully');
  });
});

// Get payment details from the database
app.get('/paymentDetails', (req, res) => {
  const query = 'SELECT * FROM fastmove.PaymentDetails';

  connection.query(query, (err, data) => {
    if (err) {
      return res.status(500).json({ error: 'An error occurred while fetching payment details' });
    }

    const paymentDetails = data.map(({ Payment_ID, Bus_No, User_ID, Amount, Transferred_at }) => ({
      Payment_ID,
      Bus_No,
      User_ID,
      Amount,
      Transferred_at,
    }));

    return res.json(paymentDetails);
  });
});

// Route for uploading files
app.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const filePath = req.file.path;
  return res.json({ message: 'File uploaded successfully', path: filePath });
});



// Get owner inquiries
app.get('/helpOwner', (req, res) => {
  const query = 'SELECT * FROM fastmove.inquiry_bus_owner';

  connection.query(query, (err, data) => {
    if (err) {
      return res.status(500).json({ error: 'An error occurred while fetching owner inquiries' });
    }

    const inquiryBusOwner = data.map(({ InquiryID, UserID, type_of_issue, complain }) => ({
      InquiryID,
      UserID,
      type_of_issue,
      complain,
    }));

    return res.json(inquiryBusOwner);
  });
});

// Handle POST request for conductor registration
app.post(
  '/conductorReg',
  upload.fields([{ name: 'nicScanCopy', maxCount: 1 }, { name: 'conductorLicen', maxCount: 1 }]),
  (req, res) => {
    const query = 'SELECT conductorId FROM conductor_registration WHERE conductorId = ?';
    const values = [req.body.username];

    connection.query(query, values, (err, rows) => {
      if (err) {
        console.error('Error executing the query: ', err);
        return res.status(500).json({ error: 'An error occurred while registering the conductor' });
      }

      if (rows.length > 0) {
        return res.status(409).json({ error: 'Conductor ID already exists' });
      }

      const nicScanCopy = req.files && req.files['nicScanCopy'] ? req.files['nicScanCopy'][0].filename : null;
      const conductorLicen = req.files && req.files['conductorLicen'] ? req.files['conductorLicen'][0].filename : null;
      console.log(nicScanCopy);
      const insertQuery =
        'INSERT INTO conductor_registration(username, password, mobileNumber, email, nicScanCopy, conductorLicen) VALUES (?, ?, ?, ?, ?, ?)';
      const insertValues = [
        req.body.username,
        req.body.password,
        req.body.mobileNumber,
        req.body.email,
        req.body.nicScanCopy,
        req.body.conductorLicense,
      ];

      connection.query(insertQuery, insertValues, (err) => {
        if (err) {
          console.error('Error executing the query: ', err);
          return res.status(500).json({ error: 'An error occurred while registering the conductor' });
        }

        console.log('Successfully added');
        return res.status(200).json({ message: 'Conductor registered successfully' });
      });
    });
  }
);

app.get('/busesreg', (req, res) => {
  const query = 'SELECT * FROM fastmove.Bus_Registration';

  connection.query(query, (err, data) => {
    if (err) {
      return res.status(500).json({ error: 'An error occurred while getting registered bus details ' });
    }

    const  busRegistration = data.map(({ Bus_No,UserID,No_ofSeats,Bus_type,Bus_Lisence_startDate,Bus_Lisence_expireDate,BusLisence_scancopy }) => ({
      Bus_No,
      UserID,
      No_ofSeats,
      Bus_type,
      Bus_Lisence_startDate,
      Bus_Lisence_expireDate,
      BusLisence_scancopy,
    }));

    return res.json(busRegistration);
  });
});

app.delete('/busesreg/:busNo', (req, res) => {
  const busNo = req.params.busNo;

  const query = 'DELETE FROM fastmove.Bus_Registration WHERE Bus_No = ?';

  connection.query(query, [busNo], (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'An error occurred while deleting the row' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Row not found' });
    }

    // Send success response
    return res.json({ message: 'Row deleted successfully' });
  });
});

// passenger -------------------------------

// Route for getting verified passengers - correct 1st end point
app.get('/verification', (req, res) => {
  const query = 'SELECT * FROM fastmove.passengers where IsVerified = 0';
  connection.query(query, (err, data) => {
    if (err) {
      console.error('Error executing the query: ', err);
      return res.status(500).json({ error: 'An error occurred while fetching passenger details' });
    }
    return res.json(data);
  });
});

// verify passsenger --- correct 2nd end point
app.post('/passengerverify/:UserID', (req, res) => {
  const UserID = req.params.UserID;
  const query =`UPDATE fastmove.passengers SET IsVerified = 1  WHERE UserID=?`;
  const user_email = `SELECT Email from fastmove.passengers WHERE UserID = ${UserID}`;

  const needed_user_email = "";

  connection.query(user_email, (error, results) => {
    if (error) {
      console.error('Error executing SELECT query:', error);
      return;
    }
    // Process the query results
    console.log(results);
    console.table(results);
    console.log(results[0].Email);
    let needed_user_email = results[0].Email;
  });

  console.log(needed_user_email);



  // //dilini-email
  // const contactEmail = nodemailer.createTransport({
  //   service: 'gmail',
  //   auth: {
  //     user: "desilvasajini09@gmail.com",
  //     pass: "rlifsmmdcdwlqijt",
  //   },
  // });

  // contactEmail.verify((error) => {
  //   if (error) {
  //     console.log(error);
  //   } else {
  //     console.log("Ready to Send");
  //   }
  // });

  // router.post("/passengerMail", (req, res) => {
  //   console.log("sent");
  //   const mail = {
  //     from: "desilvasajini09@gmail.com",
  //     to: needed_user_email ,
  //     subject: "Verified passenger",
  //     html: `<p>You are verified</p>`,
  //   };
  //   contactEmail.sendMail(mail, (error) => {
  //     if (error) {
  //       res.json({ status: "ERROR" });
  //     } else {
  //       res.json({ status: "Message Sent" });
        
  //     }
  //   });
  // });
  // //dilini-end

  connection.query(query, [UserID], (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'An error occurred while verifing the row' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Row not found' });
    }

    // Send success response
    return res.json({ message: 'Passenger Verified successfully'});
  });
});




// 5th end point 
app.delete('/deletepassenger/:UserID', (req, res) => {  
  const UserID = req.params.UserID;

  const query = 'DELETE FROM fastmove.passengers WHERE UserID = ?';

  connection.query(query, [UserID], (err, result) => {
    
    if (err) {
      return res.status(500).json({ error: 'An error occurred while deleting the row' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Row not found' });
    }

    // Send success response
    return res.json({ message: 'Passenger deleted successfully' });
  });
});

// Route for getting all verified passengers --- correct 4th end point
app.get('/verifiedpassenger' , (req, res) => {
  const query = 'SELECT * FROM fastmove.passengers where IsVerified=1';
  connection.query(query, (err, data) => {
    if (err) {
      console.error('Error executing the query: ', err);
      return res.status(500).json({ error: 'An error occurred while fetching passenger details' });
    }
    return res.json(data);
  });
});
// delete not verified passenger -- correct  3rd end point 
app.delete('/deleteverifypa/:UserID', (req, res) => {
  const UserID = req.params.UserID;

  const query = 'DELETE FROM fastmove.passengers WHERE UserID = ?';

  connection.query(query, [UserID], (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'An error occurred while deleting the row' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Row not found' });
    }

    // Send success response
    return res.json({ message: 'Passenger  deleted successfully' });
  });
});




//  bus owner -----------------------------------------------------------------------------
app.get('/ownerverification', (req, res) => {
  const query = 'SELECT * FROM fastmove.BusOwner_Registration WHERE IsVerified = 0';
  connection.query(query, (err, data) => {
    if (err) {
      console.error('Error executing the query: ', err);
      return res.status(500).json({ error: 'An error occurred while fetching bus owner details' });
    }
    return res.json(data);
  });
});

app.post('/ownerverify/:UserID', (req, res) => {
  const UserID = req.params.UserID;
  const query = `UPDATE fastmove.BusOwner_Registration SET IsVerified = 1 WHERE UserID = ?`;

  connection.query(query, [UserID], (err, result) => {
    if (err) {
      console.error('Error executing the query: ', err);
      return res.status(500).json({ error: 'An error occurred while verifying the row' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Row not found' });
    }

    // Send success response
    return res.json({ message: 'Bus Owner verified successfully' });
  });
});

app.delete('/deleteverifyOw/:UserID', (req, res) => {
  const UserID = req.params.UserID;
  const query = 'DELETE FROM fastmove.BusOwner_Registration WHERE UserID = ?';

  connection.query(query, [UserID], (err, result) => {
    if (err) {
      console.error('Error executing the query: ', err);
      return res.status(500).json({ error: 'An error occurred while deleting the row' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Row not found' });
    }

    // Send success response
    return res.json({ message: 'Bus owner deleted successfully' });
  });
});

app.get('/Infoowner', (req, res) => {
  const query = 'SELECT * FROM fastmove.BusOwner_Registration WHERE IsVerified = 1';
  connection.query(query, (err, data) => {
    if (err) {
      console.error('Error executing the query: ', err);
      return res.status(500).json({ error: 'An error occurred while fetching passenger details' });
    }
    return res.json(data);
  });
});

app.delete('/deleteowner/:UserID', (req, res) => {
  const UserID = req.params.UserID;
  const query = 'DELETE FROM fastmove.BusOwner_Registration WHERE UserID = ?';

  connection.query(query, [UserID], (err, result) => {
    if (err) {
      console.error('Error executing the query: ', err);
      return res.status(500).json({ error: 'An error occurred while deleting the row' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Row not found' });
    }

    // Send success response
    return res.json({ message: 'Bus owner deleted successfully' });
  });
});

//  Passenger inquiry -------------------------------


app.get('/Helppassenger', (req, res) => {
  const query = 'SELECT * FROM fastmove.passenger_inquiry WHERE IsReply = 0';
  connection.query(query, (err, data) => {
    if (err) {
      console.error('Error executing the query: ', err);
      return res.status(500).json({ error: 'An error occurred while fetching Passenger inquiry' });
    }
    return res.json(data);
  });
});

app.post('/ownerreply/:InquiryID/:Reply', (req, res) => {
  const InquiryID = req.params.InquiryID;
  const Reply = req.params.Reply; 
  const query = `UPDATE fastmove.passenger_inquiry SET IsReply = 1, Reply = ? WHERE InquiryID = ?`;

  connection.query(query, [Reply, InquiryID], (err, result) => {
    if (err) {
      console.error('Error executing the query: ', err);
      return res.status(500).json({ error: 'An error occurred while replying to the row' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Row not found' });
    }

    // Send success response
    return res.json({ message: 'Reply sent successfully' });
  });
});


app.get('/sendreplypassenger', (req, res) => {
  const query = 'SELECT * FROM fastmove.passenger_inquiry WHERE IsReply = 1';
  connection.query(query, (err, data) => {
    if (err) {
      console.error('Error executing the query: ', err);
      return res.status(500).json({ error: 'An error occurred while fetching replied inquiries' });
    }
    return res.json(data);
  });
});


app.delete('/deletepassengerreply/:InquiryID', (req, res) => {
  const InquiryID = req.params.InquiryID;
  const query = 'DELETE FROM fastmove.passenger_inquiry WHERE InquiryID = ?';

  connection.query(query, [InquiryID], (err, result) => {
    if (err) {
      console.error('Error executing the query: ', err);
      return res.status(500).json({ error: 'An error occurred while deleting the row' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Row not found' });
    }

    // Send success response
    return res.json({ message: 'Passenger reply deleted successfully' });
  });
});



//owner inquiry   ----------------------------------------------
app.get('/IssuesOwner', (req, res) => {
  const query = 'SELECT * FROM fastmove.inquiry_bus_owner WHERE IsReply = 0';
  connection.query(query, (err, data) => {
    if (err) {
      console.error('Error executing the query: ', err);
      return res.status(500).json({ error: 'An error occurred while fetching owner Inquiry Infromation ' });
    }
    return res.json(data);
  });
});  

app.post('/Replyissues/:InquiryID/:Reply', (req, res) => {
  const InquiryID = req.params.InquiryID;
  const Reply = req.params.Reply; 
  const query = `UPDATE fastmove.inquiry_bus_owner SET IsReply = 1, Reply = ? WHERE InquiryID = ?`;

  connection.query(query, [Reply, InquiryID], (err, result) => {
    if (err) {
      console.error('Error executing the query: ', err);
      return res.status(500).json({ error: 'An error occurred while replying to the row' });
    }
  
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Row not found' });
    }

    // Send success response
    return res.json({ message: 'Reply sent successfully' });  
  });
});

app.get('/sendreplyowner', (req, res) => {
  const query = 'SELECT * FROM fastmove.inquiry_bus_owner WHERE IsReply = 1';
  connection.query(query, (err, data) => {
    if (err) {
      console.error('Error executing the query: ', err);
      return res.status(500).json({ error: 'An error occurred while fetching replied inquiries' });
    }
    return res.json(data);
  });
});


app.delete('/deleteownereply/:InquiryID', (req, res) => {
  const InquiryID = req.params.InquiryID;
  const query = 'DELETE FROM fastmove.inquiry_bus_owner WHERE InquiryID = ?';

  connection.query(query, [InquiryID], (err, result) => {
    if (err) {
      console.error('Error executing the query: ', err);
      return res.status(500).json({ error: 'An error occurred while deleting the row' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Row not found' });
    }

    // Send success response
    return res.json({ message: 'Owner  reply deleted successfully' });
  });
});



app.listen(5000, () => {
  console.log('Server is running on port 5000');
});
