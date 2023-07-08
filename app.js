var connection=require('./service/connection')
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
var path = require("path");
const {router}=require('./router/route.js');
const app = express();
app.use(express.json());
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ limit: '10mb', extended: false }));
const ticketRoutes = require("./router/ticketRoutes");
const emergencyRoutes = require("./router/emergencyRoutes");
const conductorRoutes = require("./router/conductorRoutes");
const conductorShedule=require("./router/conductorsheduleroutes");
const busOwnerRoutes=require("./router/busOwnerRoues");
const dotenv = require("dotenv");
dotenv.config(); //npm i dotenv

//backend running port
const port = 5000;

//test endpoint
app.get('/', function (req, res) {
  res.send('Hello World!');
});

app.use('/api',router)
app.use("/api/tickets", ticketRoutes);
app.use("/api/conductorEmergencies", emergencyRoutes);
app.use("/api/conductors", conductorRoutes);
app.use("/api/conductorActivity", conductorShedule);
app.use("/api/busowner",busOwnerRoutes);

app.listen(port, function () {
  console.log('Example app listening on port 5000!');
});




//account details saving x
app.post("/AccountDetails",(req,res)=>{
  // const {UserID,bank,Branch,AccountNo}=req.body;
  const UserID=req.body;
  console.log(UserID);
  const ac="INSERT INTO fastmove.BankDetails(`UserID`)VALUES(?)";
  const values = [UserID]; 
  connection.query(ac,values,(err,data)=>{
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Failed to save Bank Details" });
    }
    return res.status(200).json({ message: "Saved Bank Details successfully" });
  });
});

//update bus lisence x
app.post("/updatebuslisence", (req, res) => {
  const { busNo, url } = req.body;
  if (!busNo || !url) {
    return res.status(400).json({ error: "Invalid request. 'busNo' and 'url' are required." });
  }
const updateQuery = "UPDATE fastmove.Bus_Registration SET BusLisence_scancopy = ? WHERE Bus_No = ?";
  connection.query(updateQuery, [url, busNo], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Failed to update Bus License scan copy." });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: `Bus with busNo '${busNo}' not found.` });
    }
    return res.status(200).json({ message: "Bus License scan copy updated successfully." });
  });
});

//get bus Bus registration details from database x
app.get("/busDetails", (req, res) => {
  var p= "SELECT * FROM fastmove.Bus_Registration;";
  connection.query(p, (err, data) => {
    if (err) return res.json(err);
    return res.json(data);
  });
});

//get busowner's revenue
app.get("/PaymentDetails", (req, res) => {
  var rev = "SELECT * FROM fastmove.PaymentDetails;";
  connection.query(rev, (err, data) => {
    if (err) return res.json(err);
    return res.json(data);
  });
});



//register new bus from frontend and send data to database  x
app.post("/addBus", (req, res) => {
const data=req.body;
 console.log(data)
  const q = "INSERT INTO fastmove.Bus_Registration(`Bus_No`,`Bus_type`,`No_ofSeats`,`Bus_Lisence_startDate`,`Bus_Lisence_expireDate`) VALUES (?,?,?,?, ?)";

    const startDate = req.body.Bus_Lisence_startDate;
  const expireDate = new Date(startDate); //calculate end date after one year from registered date
  expireDate.setMonth(expireDate.getMonth() + 12);
  

  const values = [
    req.body.Bus_No,
    req.body.Bus_type,
    req.body.No_ofSeats,
    req.body.Bus_Lisence_startDate,
    req.body.User_Email,
    expireDate
  ];
  connection.query(q,values, (err, data) => {

    if (err) return res.json(err);
    return res.json("bus has been added successfully");
  });
  console.log(values)
});



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

// // Update a profile
// app.put('/profiles/:id', (req, res) => {
//   const id = req.params.id;
//   const { user_name, password, mobile_number, email, nic_scan_copy } = req.body;
//   const sql = 'UPDATE conductor_profiles SET user_name = ?, password = ?, mobile_number = ?, email = ?, nic_scan_copy = ? WHERE conductor_id = ?';
//   db.query(sql, [user_name, password, mobile_number, email, nic_scan_copy, id], (err, result) => {
//     if (err) throw err;
//     res.send('Profile updated successfully!');
//   });
// });

// // Delete a profile
// app.delete('/profiles/:id', (req, res) => {
//   const id = req.params.id;
//   const sql = 'DELETE FROM conductor_profiles WHERE conductor_id = ?';
//   db.query(sql, [id], (err, result) => {
//     if (err) throw err;
//     res.send('Profile deleted successfully!');
//   });
// });


//get inquiries from bus owner  x
app.post("/submit-inquiry", (req, res) => {
  const s = "INSERT INTO inquiry_bus_owner(`email`,`type_of_issue`,`complain`) VALUES (?)";  
  const values = [
    req.body.email,
    req.body.type_of_issue,
    req.body.complain,
  ];
  connection.query(s,[values], (err, data) => {
    if (err) return res.json(err);
    return res.json("Inquiry is submitted successfully");
  });
  console.log(values)
});


app.get("/currentrevenue", (req, res) => {
  const query = "SELECT SUM(Amount) AS total FROM fastmove.PaymentDetails";
  
  connection.query(query, (err, data) => {
    if (err) {
      return res.json(err);
    }
    
    const totalAmount = data[0].total;
    
    return res.json({ totalAmount });
  });
});

// //bus owner inquiries
// app.post("/inquiry_bus_owner", (req, res) => {
//   const s = "INSERT INTO inquiry_bus_owner (`UserID`, `type_of_issue`, `complain`) VALUES (NULL, ?, ?)";
//   const values = [
//     req.body.type_of_issue,
//     req.body.complain
//   ];
//   connection.query(s, values, (err, data) => {
//     if (err) {
//       return res.json(err);
//     }
//     return res.json({ message: "Inquiry is submitted successfully" });
//   });
// });


//Get conductor activity shedule details
app.get("/ConductorActivity", (req, res) => {
  var condprof = "SELECT * FROM fastmove.timetable WHERE conductorId= '1';";
  connection.query(condprof, (err, data) => {
    if (err) return res.json(err);
    return res.json(data);
  });
});

//generate qr code

app.post("/api/gettickets", (req, res) =>{
  const { passengerName, source, destination, busNumber } = req.body;

  try {
    const ticketCode = generateTicketCode();
    const query = `INSERT INTO tickets (ticket_code, passenger_name, source, destination, bus_number) 
                   VALUES (?, ?, ?, ?, ?)`;
    const values = [ticketCode, passengerName, source, destination, busNumber];
    connection.query(query, values);
    res.status(201).json({ ticketCode });
  } catch (error) {
    console.error("Error generating ticket:", error);
    res.status(500).json({ error: "Failed to generate ticket." });
  }

});

//get qr code
app.get("/api/tickets}", (req, res) =>{
  const { ticketCode } = req.params;
  console.log(ticketCode);

  try {
    const query = `SELECT * FROM tickets WHERE ticket_code = ?`;
    const values = [ticketCode];
    const [rows] = connection.query(query, values);
    if (rows.length === 0) {
      res.status(404).json({ error: "Ticket not found." });
    } else {
      const ticket = rows[0];
      res.status(200).json({ ticket });
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve ticket." });
  }
});

//create qr code
function generateTicketCode() {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return code;
}

//inform emergency
app.post("/api/emergencies" , (req, res)  =>{
const {
    
     
  emergency_type,
  bus_number,
  route_no,
  journey_id,
  date,
  time,
  location,
} = req.body;

try {
  const query = `INSERT INTO emergencies ( emergency_type,bus_number,route_no ,journey_id, date,time,location) VALUES ( ?, ?,?, ?, ?,?,?)`;
  const values = [
   
    emergency_type,
    bus_number,
    route_no,
    journey_id,
    date,
    time,
    location,
  ];
  connection.query(query, values);

  // sendSMS(
  //   emergencyId,
  //   emergencyType,
  //   busNo,
  //   routeNo,
  //   routeName,
  //   date,
  //   time,
  //   location
  // );

  res.status(200).json({ message: "Insert successfully." });
} catch (error) {
  console.error("Error:", error);
  res.status(500).json({ error: "Failed insert details." });
}
});

// Inform Emergency

// define an API endpoint that handles the form submission
app.post('/submit-emergency-form', (req, res) => {
  res.send('Hello Worldfgjf!');
  const query = `INSERT INTO emergencies ( emergency_type,bus_number,route_no ,journey_id, date,time,location) VALUES ( ?, ?,?, ?, ?,?,?)`;
   
  const values = [   req.body. emergency_type,req.body.bus_number, req.body.routeNo, req.body.journey_id,    req.body.date,  req.body.time ,req.body.location];

  connection.query(query, values, (err, data) => {
  if (err) {
    console.error('Error executing query:', err);
    return res.json(err);
  }
  console.log('Emergency data inserted successfully.');
  return res.json({ message: 'Update Emergency Successfully.' });
});
});





// Endpoint for receiving emergency notifications
app.post('/api/notifications', (req, res) => {
  // Handle the emergency notification here
  const { emergency_type, bus_number, route_no, journey_id, date, time, location } = req.body;

  // Perform actions with the received data, such as sending notifications
  const notificationMessage = `Emergency Type: ${emergency_type}\nBus Number: ${bus_number}\nRoute Number: ${route_no}\nJourney ID: ${journey_id}\nDate: ${date}\nTime: ${time}\nLocation: ${location}`;

  // Example: Send email notification
  sendEmailNotification(notificationMessage);

  // Example: Send SMS notification
  sendSMSNotification(notificationMessage);

  // Example: Send push notification
  sendPushNotification(notificationMessage);

  // Example response
  res.status(200).json({ message: 'Emergency notification received successfully.' });
});

// Function to send email notification
function sendEmailNotification(message) {
  // Code to send email notification
  // Example: Using Nodemailer library
  // You need to install the nodemailer library: `npm install nodemailer`
  const nodemailer = require('nodemailer');

  // Create a transporter
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'your-email@gmail.com',
      pass: 'your-email-password',
    },
  });

  // Setup email data
  const mailOptions = {
    from: 'your-email@gmail.com',
    to: 'recipient-email@example.com',
    subject: 'Emergency Notification',
    text: message,
  };

  // Send email
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error sending email:', error);
    } else {
      console.log('Email sent:', info.response);
    }
  });
}

// Function to send SMS notification
function sendSMSNotification(message) {
  // Code to send SMS notification
  // Example: Using a third-party SMS gateway API
  // You need to sign up for an account and obtain API credentials from an SMS gateway provider

  const smsGatewayApi = 'https://api.example.com/sms';

  // Setup request data
  const requestData = {
    api_key: 'your-api-key',
    phone_number: '+1234567890',
    message: message,
  };

  // Send SMS request
  axios.post(smsGatewayApi, requestData)
    .then((response) => {
      console.log('SMS sent:', response.data);
    })
    .catch((error) => {
      console.error('Error sending SMS:', error);
    });
}

// Function to send push notification
function sendPushNotification(message) {
  // Code to send push notification
  // Example: Using a push notification service like Firebase Cloud Messaging (FCM)
  // You need to configure FCM and obtain server credentials

  const fcmServerKey = 'turing-energy-391808';

  // Setup notification data
  const notificationData = {
    to: 'device-token',
    notification: {
      title: 'Emergency Notification',
      body: message,
    },
  };

  // Send push notification request
  axios.post('https://fcm.googleapis.com/fcm/send', notificationData, {
    headers: {
      Authorization: `key=${fcmServerKey}`,
      'Content-Type': 'application/json',
    },
  })
    .then((response) => {
      console.log('Push notification sent:', response.data);
    })
    .catch((error) => {
      console.error('Error sending push notification:', error);
    });
}


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

// app.delete('/busesreg/:busNo', (req, res) => {
//   const busNo = req.params.busNo;

//   const query = 'DELETE FROM fastmove.Bus_Registration WHERE busNo = ?';
//   const user_busNo_query = `SELECT Email FROM fastmove.conductor WHERE busNo = '${busNo}'`;

//   let needed_user_busNo = "";

//   connection.query(user_busNo_query, (error, results) => {
//     if (error) {
//       console.error('Error executing SELECT query:', error);
//       return res.status(500).json({ error: 'An error occurred while retrieving the email' });
//     }

//     console.log(results);
//     console.table(results);
//     console.log(results[0].busNo);
//     needed_user_busNo = results[0].busNo;

//     const contactEmail = nodemailer.createTransport({
//       service: 'gmail',
//       auth: {
//         user: "inforfastmove@gmail.com",
//         pass: "rlifsmmdcdwlqijt",
//       },
//     });

//     contactEmail.verify((error) => {
//       if (error) {
//         console.log(error);
//         return res.status(500).json({ error: 'Failed to verify busNo transport' });
//       }

//       console.log("Ready to Send");

//       const Email = {
//         from: "inforfastmove@gmail.com",
//         to: needed_user_busNo,
//         subject: 'Fast Move Bus Pass System - Bus Successfully unregisterd  Notification',
//         html: `
//           <div style="background-color: #f2fff2; padding: 20px; font-family: Arial, sans-serif;">
//             <div style="text-align: center;">
//               <img src="https://firebasestorage.googleapis.com/v0/b/passenger-7d853.appspot.com/o/email.jpeg?alt=media&token=f7760643-e4c5-4649-a47a-00c56d3188d9" alt="Fast Move Bus Pass System Logo" style="max-width: 200px; margin-bottom: 20px;">
//             </div>
//             <h1 style="color: #008000; text-align: center; font-family: 'Times New Roman', serif;">Fast Move Bus Pass System</h1>
//             <h2 style="color: #008000; text-align: center; font-family: 'Times New Roman', serif;">Account Deletion Notification</h2>
//             <p style="font-size: 16px; color: #333; margin-bottom: 20px;">
//               Dear User,<br>
//               We regret to inform you that your account in the Fast Move Bus Pass System has been <span style="color: red;">Deleted</span>.
//             </p>
//             <p style="font-size: 16px; color: #333; margin-bottom: 20px;">
//               If you believe this was done in error or have any concerns, please contact our support team at:
//               <br>
//               Phone: <span style="color: #008000;">0703806075</span>
//               <br>
//               Email: <span style="color: #008000;">fastmovebusbasssystem@gmail.com</span>
//             </p>
//             <p style="font-size: 16px; color: #333;">
//               Thank you for being a part of the Fast Move Bus Pass System.
//             </p>
//             <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
//             <p style="font-size: 14px; color: #666; text-align: center;">
//               This email is automated. Please do not reply.
//             </p>
//           </div>
//         `,
//       };

//       contactEmail.sendMail(mail, (error) => {
//         if (error) {
//           console.error('Error sending email:', error);
//           return res.status(500).json({ error: 'Failed to send email' });
//         }

//         connection.query(query, [Email], (err, result) => {
//           if (err) {
//             console.error('Error executing DELETE query:', err);
//             return res.status(500).json({ error: 'An error occurred while deleting the row' });
//           }

//           if (result.affectedRows === 0) {
//             return res.status(404).json({ error: 'Row not found' });
//           }

//           return res.json({ message: 'Row deleted successfully' });
//         });
//       });
//     });
//   });
// });
















//  bus owner -----------------------------------------------------------------------------
app.get('/ownerverification', (req, res) => {
  const query = 'SELECT * FROM  fastmove.busowner  WHERE IsVerified = 0';
  connection.query(query, (err, data) => {
    if (err) {
      console.error('Error executing the query: ', err);
      return res.status(500).json({ error: 'An error occurred while fetching bus owner details' });
    }
    return res.json(data);
  });
});
// ---- email 
app.post('/ownerverify/:Email', (req, res) => {
  const Email = req.params.Email;
  const query = `UPDATE fastmove.busowner SET IsVerified = 1 WHERE Email=?`;
  const user_email = `SELECT Email from fastmove.busowner WHERE Email = '${Email}'`;

  let needed_user_email = "";

  connection.query(user_email, (error, results) => {
    if (error) {
      console.error('Error executing SELECT query:', error);
      return res.status(500).json({ error: 'An error occurred while retrieving the email' });
    }

    console.log(results);
    console.table(results);
    console.log(results[0].Email);
    needed_user_email = results[0].Email;

    const contactEmail = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.USER_EMAIL, // generated ethereal user
      pass: process.env.PASSWORD, // generated ethereal password
      },
    });

    contactEmail.verify((error) => {
      if (error) {
        console.log(error);
        return res.status(500).json({ error: 'Failed to verify email transport' });
      }

      console.log("Ready to Send");

      const mail = {
        from: "inforfastmove@gmail.com",
        to: needed_user_email,
        subject: 'Fast Move Bus Pass System - Account Verification',
        html: `
          <div style="background-color: #f2fff2; padding: 20px; font-family: Arial, sans-serif;">
            <div style="text-align: center;">
              <img src="https://firebasestorage.googleapis.com/v0/b/passenger-7d853.appspot.com/o/email.jpeg?alt=media&token=f7760643-e4c5-4649-a47a-00c56d3188d9" alt="Fast Move Bus Pass System Logo" style="max-width: 200px; margin-bottom: 20px;">
            </div>
            <h1 style="color: #01281a; text-align: center; font-family: 'Times New Roman', serif;">Fast Move Bus Pass System</h1>
            <h2 style="color: #008000; text-align: center; font-family: 'Times New Roman', serif;">Account Verification</h2>
            <p style="font-size: 16px; color: #333; margin-bottom: 20px;">
              Dear User,<br>
              Your account in the Fast Move Bus Pass System has been <span style="color: green; font-weight: bold;">Verified</span>.
            </p>
            <p style="font-size: 16px; color: #333;">
              Thank you for being a part of the Fast Move Bus Pass System.
            </p>
            <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
            <p style="font-size: 14px; color: #666; text-align: center;">
              This email is automated. Please do not reply.
            </p>
          </div>
        `,
      };

      contactEmail.sendMail(mail, (error) => {
        if (error) {
          console.error('Error sending email:', error);
          return res.status(500).json({ error: 'Failed to send email' });
        }

        connection.query(query, [Email], (err, result) => {
          if (err) {
            console.error('Error executing UPDATE query:', err);
            return res.status(500).json({ error: 'An error occurred while verifying the row' });
          }

          if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Row not found' });
          }

          return res.json({ message: 'User  verified successfully' });
        });
      });
    });
  });
});
app.delete('/deleteverifyowner/:Email', (req, res) => {
  const Email = req.params.Email;

  const query = 'DELETE FROM fastmove.busowner WHERE Email = ?';
  const user_email_query = `SELECT Email FROM fastmove.busowner WHERE Email = '${Email}'`;

  let needed_user_email = "";

  connection.query(user_email_query, (error, results) => {
    if (error) {
      console.error('Error executing SELECT query:', error);
      return res.status(500).json({ error: 'An error occurred while retrieving the email' });
    }

    console.log(results);
    console.table(results);
    console.log(results[0].Email);
    needed_user_email = results[0].Email;

    const contactEmail = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.USER_EMAIL, // generated ethereal user
        pass: process.env.PASSWORD, // generated ethereal password
      },
    });

    contactEmail.verify((error) => {
      if (error) {
        console.log(error);
        return res.status(500).json({ error: 'Failed to verify email transport' });
      }

      console.log("Ready to Send");

      const mail = {
        from: "inforfastmove@gmail.com",
        to: needed_user_email,
        subject: 'Fast Move Bus Pass System - Account Deletion Notification',
        html: `
    <div style="background-color: #f2fff2; padding: 20px; font-family: Arial, sans-serif;">
      <div style="text-align: center;">
        <img src="https://firebasestorage.googleapis.com/v0/b/passenger-7d853.appspot.com/o/email.jpeg?alt=media&token=f7760643-e4c5-4649-a47a-00c56d3188d9" alt="Fast Move Bus Pass System Logo" style="max-width: 200px; margin-bottom: 20px;">
      </div>
      <h1 style="color: #008000; text-align: center; font-family: 'Times New Roman', serif;">Fast Move Bus Pass System</h1>
      <h2 style="color: #008000; text-align: center; font-family: 'Times New Roman', serif;">Account Deletion Notification</h2>
      <p style="font-size: 16px; color: #333; margin-bottom: 20px;">
        Dear User,<br>
        We regret to inform you that your account in the Fast Move Bus Pass System has been <span style="color: red;">deleted</span>.
      </p>
      <p style="font-size: 16px; color: #333; margin-bottom: 20px;">
        If you believe this was done in error or have any concerns, please contact our support team at:
        <br>
        Phone: <span style="color: #008000;">0703806075</span>
        <br>
        Email: <span style="color: #008000;">fastmovebusbasssystem@gmail.com</span>
      </p>
      <p style="font-size: 16px; color: #333;">
        Thank you for being a part of the Fast Move Bus Pass System.
      </p>
      <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
      <p style="font-size: 14px; color: #666; text-align: center;">
        This email is automated. Please do not reply.
      </p>
    </div>
        `,
      };

      contactEmail.sendMail(mail, (error) => {
        if (error) {
          console.error('Error sending email:', error);
          return res.status(500).json({ error: 'Failed to send email' });
        }

        connection.query(query, [Email], (err, result) => {
          if (err) {
            console.error('Error executing DELETE query:', err);
            return res.status(500).json({ error: 'An error occurred while deleting the row' });
          }

          if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Row not found' });
          }

          return res.json({ message: 'Row deleted successfully' });
        });
      });
    });
  });
});


app.delete('/deleteowner/:Email', (req, res) => {
  const Email = req.params.Email;

  const query = 'DELETE FROM fastmove.busowner WHERE Email = ?';
  const user_email_query = `SELECT Email FROM fastmove.busowner WHERE Email = '${Email}'`;

  let needed_user_email = "";

  connection.query(user_email_query, (error, results) => {
    if (error) {
      console.error('Error executing SELECT query:', error);
      return res.status(500).json({ error: 'An error occurred while retrieving the email' });
    }

    console.log(results);
    console.table(results);
    console.log(results[0].Email);
    needed_user_email = results[0].Email;

    const contactEmail = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.USER_EMAIL, // generated ethereal user
        pass: process.env.PASSWORD, // generated ethereal password
      },
    });

    contactEmail.verify((error) => {
      if (error) {
        console.log(error);
        return res.status(500).json({ error: 'Failed to verify email transport' });
      }

      console.log("Ready to Send");

      const mail = {
        from: "inforfastmove@gmail.com",
        to: needed_user_email,
        subject: 'Fast Move Bus Pass System - Account Deletion Notification',
        html: `
          <div style="background-color: #f2fff2; padding: 20px; font-family: Arial, sans-serif;">
            <div style="text-align: center;">
              <img src="https://firebasestorage.googleapis.com/v0/b/passenger-7d853.appspot.com/o/email.jpeg?alt=media&token=f7760643-e4c5-4649-a47a-00c56d3188d9" alt="Fast Move Bus Pass System Logo" style="max-width: 200px; margin-bottom: 20px;">
            </div>
            <h1 style="color: #008000; text-align: center; font-family: 'Times New Roman', serif;">Fast Move Bus Pass System</h1>
            <h2 style="color: #008000; text-align: center; font-family: 'Times New Roman', serif;">Account Deletion Notification</h2>
            <p style="font-size: 16px; color: #333; margin-bottom: 20px;">
              Dear User,<br>
              We regret to inform you that your account in the Fast Move Bus Pass System has been <span style="color: red;">Deleted</span>.
            </p>
            <p style="font-size: 16px; color: #333; margin-bottom: 20px;">
              If you believe this was done in error or have any concerns, please contact our support team at:
              <br>
              Phone: <span style="color: #008000;">0703806075</span>
              <br>
              Email: <span style="color: #008000;">fastmovebusbasssystem@gmail.com</span>
            </p>
            <p style="font-size: 16px; color: #333;">
              Thank you for being a part of the Fast Move Bus Pass System.
            </p>
            <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
            <p style="font-size: 14px; color: #666; text-align: center;">
              This email is automated. Please do not reply.
            </p>
          </div>
        `,
      };

      contactEmail.sendMail(mail, (error) => {
        if (error) {
          console.error('Error sending email:', error);
          return res.status(500).json({ error: 'Failed to send email' });
        }

        connection.query(query, [Email], (err, result) => {
          if (err) {
            console.error('Error executing DELETE query:', err);
            return res.status(500).json({ error: 'An error occurred while deleting the row' });
          }

          if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Row not found' });
          }

          return res.json({ message: 'Row deleted successfully' });
        });
      });
    });
  });
});

app.get('/Infoowner', (req, res) => {
  const query = 'SELECT * FROM fastmove.busowner WHERE IsVerified = 1';
  connection.query(query, (err, data) => {
    if (err) {
      console.error('Error executing the query: ', err);
      return res.status(500).json({ error: 'An error occurred while fetching owner details' });
    }
    return res.json(data);
  });
});


// passenger--------------------------------------------------------------------------------------


app.get('/passengerverification', (req, res) => {
  const query = 'SELECT * FROM  fastmove.passenger  WHERE IsVerified = 0';
  connection.query(query, (err, data) => {
    if (err) {
      console.error('Error executing the query: ', err);
      return res.status(500).json({ error: 'An error occurred while fetching passenger  details' });
    }
    return res.json(data);
  });
});


app.post('/passengerify/:Email', (req, res) => {
  const Email = req.params.Email;
  const query = `UPDATE fastmove.passenger SET IsVerified = 1 WHERE Email=?`;
  const user_email = `SELECT Email from fastmove.passenger WHERE Email = '${Email}'`;

  let needed_user_email = "";

  connection.query(user_email, (error, results) => {
    if (error) {
      console.error('Error executing SELECT query:', error);
      return res.status(500).json({ error: 'An error occurred while retrieving the email' });
    }

    console.log(results);
    console.table(results);
    console.log(results[0].Email);
    needed_user_email = results[0].Email;

    const contactEmail = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: "inforfastmove@gmail.com",
        pass: "rlifsmmdcdwlqijt",
      },
    });

    contactEmail.verify((error) => {
      if (error) {
        console.log(error);
        return res.status(500).json({ error: 'Failed to verify email transport' });
      }

      console.log("Ready to Send");

      const mail = {
        from: "inforfastmove@gmail.com",
        to: needed_user_email,
        subject: 'Fast Move Bus Pass System - Account Verification',
        html: `
          <div style="background-color: #f2fff2; padding: 20px; font-family: Arial, sans-serif;">
            <div style="text-align: center;">
              <img src="https://firebasestorage.googleapis.com/v0/b/passenger-7d853.appspot.com/o/email.jpeg?alt=media&token=f7760643-e4c5-4649-a47a-00c56d3188d9" alt="Fast Move Bus Pass System Logo" style="max-width: 200px; margin-bottom: 20px;">
            </div>
            <h1 style="color: #01281a; text-align: center; font-family: 'Times New Roman', serif;">Fast Move Bus Pass System</h1>
            <h2 style="color: #008000; text-align: center; font-family: 'Times New Roman', serif;">Account Verification</h2>
            <p style="font-size: 16px; color: #333; margin-bottom: 20px;">
              Dear User,<br>
              Your account in the Fast Move Bus Pass System has been <span style="color: green; font-weight: bold;">Verified</span>.
            </p>
            <p style="font-size: 16px; color: #333;">
              Thank you for being a part of the Fast Move Bus Pass System.
            </p>
            <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
            <p style="font-size: 14px; color: #666; text-align: center;">
              This email is automated. Please do not reply.
            </p>
          </div>
        `,
      };

      contactEmail.sendMail(mail, (error) => {
        if (error) {
          console.error('Error sending email:', error);
          return res.status(500).json({ error: 'Failed to send email' });
        }

        connection.query(query, [Email], (err, result) => {
          if (err) {
            console.error('Error executing UPDATE query:', err);
            return res.status(500).json({ error: 'An error occurred while verifying the row' });
          }

          if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Row not found' });
          }

          return res.json({ message: 'User  verified successfully' });
        });
      });
    });
  });
});

app.delete('/deleteverifypassenger/:Email', (req, res) => {
  const Email = req.params.Email;

  const query = 'DELETE FROM fastmove.passenger WHERE Email = ?';
  const user_email_query = `SELECT Email FROM fastmove.passenger WHERE Email = '${Email}'`;

  let needed_user_email = "";

  connection.query(user_email_query, (error, results) => {
    if (error) {
      console.error('Error executing SELECT query:', error);
      return res.status(500).json({ error: 'An error occurred while retrieving the email' });
    }

    console.log(results);
    console.table(results);
    console.log(results[0].Email);
    needed_user_email = results[0].Email;

    const contactEmail = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.USER_EMAIL, // generated ethereal user
      pass: process.env.PASSWORD, // generated ethereal password
      },
    });

    contactEmail.verify((error) => {
      if (error) {
        console.log(error);
        return res.status(500).json({ error: 'Failed to verify email transport' });
      }

      console.log("Ready to Send");

      const mail = {
        from: "inforfastmove@gmail.com",
        to: needed_user_email,
        subject: 'Fast Move Bus Pass System - Account Deletion Notification',
        html: `
    <div style="background-color: #f2fff2; padding: 20px; font-family: Arial, sans-serif;">
      <div style="text-align: center;">
        <img src="https://firebasestorage.googleapis.com/v0/b/passenger-7d853.appspot.com/o/email.jpeg?alt=media&token=f7760643-e4c5-4649-a47a-00c56d3188d9" alt="Fast Move Bus Pass System Logo" style="max-width: 200px; margin-bottom: 20px;">
      </div>
      <h1 style="color: #008000; text-align: center; font-family: 'Times New Roman', serif;">Fast Move Bus Pass System</h1>
      <h2 style="color: #008000; text-align: center; font-family: 'Times New Roman', serif;">Account Deletion Notification</h2>
      <p style="font-size: 16px; color: #333; margin-bottom: 20px;">
        Dear User,<br>
        We regret to inform you that your account in the Fast Move Bus Pass System has been <span style="color: red;">deleted</span>.
      </p>
      <p style="font-size: 16px; color: #333; margin-bottom: 20px;">
        If you believe this was done in error or have any concerns, please contact our support team at:
        <br>
        Phone: <span style="color: #008000;">0703806075</span>
        <br>
        Email: <span style="color: #008000;">fastmovebusbasssystem@gmail.com</span>
      </p>
      <p style="font-size: 16px; color: #333;">
        Thank you for being a part of the Fast Move Bus Pass System.
      </p>
      <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
      <p style="font-size: 14px; color: #666; text-align: center;">
        This email is automated. Please do not reply.
      </p>
    </div>
        `,
      };

      contactEmail.sendMail(mail, (error) => {
        if (error) {
          console.error('Error sending email:', error);
          return res.status(500).json({ error: 'Failed to send email' });
        }

        connection.query(query, [Email], (err, result) => {
          if (err) {
            console.error('Error executing DELETE query:', err);
            return res.status(500).json({ error: 'An error occurred while deleting the row' });
          }

          if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Row not found' });
          }

          return res.json({ message: 'Row deleted successfully' });
        });
      });
    });
  });
});


app.delete('/deletetopassenger/:Email', (req, res) => {
  const Email = req.params.Email;

  const query = 'DELETE FROM fastmove.passenger WHERE Email = ?';
  const user_email_query = `SELECT Email FROM fastmove.passenger WHERE Email = '${Email}'`;

  let needed_user_email = "";

  connection.query(user_email_query, (error, results) => {
    if (error) {
      console.error('Error executing SELECT query:', error);
      return res.status(500).json({ error: 'An error occurred while retrieving the email' });
    }

    console.log(results);
    console.table(results);
    console.log(results[0].Email);
    needed_user_email = results[0].Email;

    const contactEmail = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.USER_EMAIL, // generated ethereal user
        pass: process.env.PASSWORD, // generated ethereal password
      },
    });

    contactEmail.verify((error) => {
      if (error) {
        console.log(error);
        return res.status(500).json({ error: 'Failed to verify email transport' });
      }

      console.log("Ready to Send");

      const mail = {
        from: "inforfastmove@gmail.com",
        to: needed_user_email,
        subject: 'Fast Move Bus Pass System - Account Deletion Notification',
        html: `
          <div style="background-color: #f2fff2; padding: 20px; font-family: Arial, sans-serif;">
            <div style="text-align: center;">
              <img src="https://firebasestorage.googleapis.com/v0/b/passenger-7d853.appspot.com/o/email.jpeg?alt=media&token=f7760643-e4c5-4649-a47a-00c56d3188d9" alt="Fast Move Bus Pass System Logo" style="max-width: 200px; margin-bottom: 20px;">
            </div>
            <h1 style="color: #008000; text-align: center; font-family: 'Times New Roman', serif;">Fast Move Bus Pass System</h1>
            <h2 style="color: #008000; text-align: center; font-family: 'Times New Roman', serif;">Account Deletion Notification</h2>
            <p style="font-size: 16px; color: #333; margin-bottom: 20px;">
              Dear User,<br>
              We regret to inform you that your account in the Fast Move Bus Pass System has been <span style="color: red;">Deleted</span>.
            </p>
            <p style="font-size: 16px; color: #333; margin-bottom: 20px;">
              If you believe this was done in error or have any concerns, please contact our support team at:
              <br>
              Phone: <span style="color: #008000;">0703806075</span>
              <br>
              Email: <span style="color: #008000;">fastmovebusbasssystem@gmail.com</span>
            </p>
            <p style="font-size: 16px; color: #333;">
              Thank you for being a part of the Fast Move Bus Pass System.
            </p>
            <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
            <p style="font-size: 14px; color: #666; text-align: center;">
              This email is automated. Please do not reply.
            </p>
          </div>
        `,
      };

      contactEmail.sendMail(mail, (error) => {
        if (error) {
          console.error('Error sending email:', error);
          return res.status(500).json({ error: 'Failed to send email' });
        }

        connection.query(query, [Email], (err, result) => {
          if (err) {
            console.error('Error executing DELETE query:', err);
            return res.status(500).json({ error: 'An error occurred while deleting the row' });
          }

          if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Row not found' });
          }

          return res.json({ message: 'Row deleted successfully' });
        });
      });
    });
  });
});

app.get('/passengertoget', (req, res) => {
  const query = 'SELECT * FROM fastmove.passenger WHERE IsVerified = 1';
  connection.query(query, (err, data) => {
    if (err) {
      console.error('Error executing the query: ', err);
      return res.status(500).json({ error: 'An error occurred while fetching owner details' });
    }
    return res.json(data);
  });
});

// conductor


app.get('/conductorverification', (req, res) => {
  const query = 'SELECT * FROM  fastmove.conductor  WHERE IsVerified = 0';
  connection.query(query, (err, data) => {
    if (err) {
      console.error('Error executing the query: ', err);
      return res.status(500).json({ error: 'An error occurred while fetching passenger  details' });
    }
    return res.json(data);
  });
});


app.post('/conductorverify/:Email', (req, res) => {
  const Email = req.params.Email;
  const query = `UPDATE fastmove.conductor SET IsVerified = 1 WHERE Email=?`;
  const user_email = `SELECT Email from fastmove.conductor WHERE Email = '${Email}'`;

  let needed_user_email = "";

  connection.query(user_email, (error, results) => {
    if (error) {
      console.error('Error executing SELECT query:', error);
      return res.status(500).json({ error: 'An error occurred while retrieving the email' });
    }

    console.log(results);
    console.table(results);
    console.log(results[0].Email);
    needed_user_email = results[0].Email;

    const contactEmail = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.USER_EMAIL, // generated ethereal user
        pass: process.env.PASSWORD, // generated ethereal password
      },
    });

    contactEmail.verify((error) => {
      if (error) {
        console.log(error);
        return res.status(500).json({ error: 'Failed to verify email transport' });
      }

      console.log("Ready to Send");

      const mail = {
        from: "inforfastmove@gmail.com",
        to: needed_user_email,
        subject: 'Fast Move Bus Pass System - Account Verification',
        html: `
          <div style="background-color: #f2fff2; padding: 20px; font-family: Arial, sans-serif;">
            <div style="text-align: center;">
              <img src="https://firebasestorage.googleapis.com/v0/b/passenger-7d853.appspot.com/o/email.jpeg?alt=media&token=f7760643-e4c5-4649-a47a-00c56d3188d9" alt="Fast Move Bus Pass System Logo" style="max-width: 200px; margin-bottom: 20px;">
            </div>
            <h1 style="color: #01281a; text-align: center; font-family: 'Times New Roman', serif;">Fast Move Bus Pass System</h1>
            <h2 style="color: #008000; text-align: center; font-family: 'Times New Roman', serif;">Account Verification</h2>
            <p style="font-size: 16px; color: #333; margin-bottom: 20px;">
              Dear User,<br>
              Your account in the Fast Move Bus Pass System has been <span style="color: green; font-weight: bold;">Verified</span>.
            </p>
            <p style="font-size: 16px; color: #333;">
              Thank you for being a part of the Fast Move Bus Pass System.
            </p>
            <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
            <p style="font-size: 14px; color: #666; text-align: center;">
              This email is automated. Please do not reply.
            </p>
          </div>
        `,
      };

      contactEmail.sendMail(mail, (error) => {
        if (error) {
          console.error('Error sending email:', error);
          return res.status(500).json({ error: 'Failed to send email' });
        }

        connection.query(query, [Email], (err, result) => {
          if (err) {
            console.error('Error executing UPDATE query:', err);
            return res.status(500).json({ error: 'An error occurred while verifying the row' });
          }

          if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Row not found' });
          }

          return res.json({ message: 'User  verified successfully' });
        });
      });
    });
  });
});

app.delete('/deleteverifyconductor/:Email', (req, res) => {
  const Email = req.params.Email;

  const query = 'DELETE FROM fastmove.conductor WHERE Email = ?';
  const user_email_query = `SELECT Email FROM fastmove.conductor WHERE Email = '${Email}'`;

  let needed_user_email = "";

  connection.query(user_email_query, (error, results) => {
    if (error) {
      console.error('Error executing SELECT query:', error);
      return res.status(500).json({ error: 'An error occurred while retrieving the email' });
    }

    console.log(results);
    console.table(results);
    console.log(results[0].Email);
    needed_user_email = results[0].Email;

    const contactEmail = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.USER_EMAIL, // generated ethereal user
        pass: process.env.PASSWORD, // generated ethereal password
      },
    });

    contactEmail.verify((error) => {
      if (error) {
        console.log(error);
        return res.status(500).json({ error: 'Failed to verify email transport' });
      }

      console.log("Ready to Send");

      const mail = {
        from: "inforfastmove@gmail.com",
        to: needed_user_email,
        subject: 'Fast Move Bus Pass System - Account Deletion Notification',
        html: `
    <div style="background-color: #f2fff2; padding: 20px; font-family: Arial, sans-serif;">
      <div style="text-align: center;">
        <img src="https://firebasestorage.googleapis.com/v0/b/passenger-7d853.appspot.com/o/email.jpeg?alt=media&token=f7760643-e4c5-4649-a47a-00c56d3188d9" alt="Fast Move Bus Pass System Logo" style="max-width: 200px; margin-bottom: 20px;">
      </div>
      <h1 style="color: #008000; text-align: center; font-family: 'Times New Roman', serif;">Fast Move Bus Pass System</h1>
      <h2 style="color: #008000; text-align: center; font-family: 'Times New Roman', serif;">Account Deletion Notification</h2>
      <p style="font-size: 16px; color: #333; margin-bottom: 20px;">
        Dear User,<br>
        We regret to inform you that your account in the Fast Move Bus Pass System has been <span style="color: red;">deleted</span>.
      </p>
      <p style="font-size: 16px; color: #333; margin-bottom: 20px;">
        If you believe this was done in error or have any concerns, please contact our support team at:
        <br>
        Phone: <span style="color: #008000;">0703806075</span>
        <br>
        Email: <span style="color: #008000;">fastmovebusbasssystem@gmail.com</span>
      </p>
      <p style="font-size: 16px; color: #333;">
        Thank you for being a part of the Fast Move Bus Pass System.
      </p>
      <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
      <p style="font-size: 14px; color: #666; text-align: center;">
        This email is automated. Please do not reply.
      </p>
    </div>
        `,
      };

      contactEmail.sendMail(mail, (error) => {
        if (error) {
          console.error('Error sending email:', error);
          return res.status(500).json({ error: 'Failed to send email' });
        }

        connection.query(query, [Email], (err, result) => {
          if (err) {
            console.error('Error executing DELETE query:', err);
            return res.status(500).json({ error: 'An error occurred while deleting the row' });
          }

          if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Row not found' });
          }

          return res.json({ message: 'Row deleted successfully' });
        });
      });
    });
  });
});


app.delete('/deleteconductor/:Email', (req, res) => {
  const Email = req.params.Email;

  const query = 'DELETE FROM fastmove.conductor WHERE Email = ?';
  const user_email_query = `SELECT Email FROM fastmove.conductor WHERE Email = '${Email}'`;

  let needed_user_email = "";

  connection.query(user_email_query, (error, results) => {
    if (error) {
      console.error('Error executing SELECT query:', error);
      return res.status(500).json({ error: 'An error occurred while retrieving the email' });
    }

    console.log(results);
    console.table(results);
    console.log(results[0].Email);
    needed_user_email = results[0].Email;

    const contactEmail = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.USER_EMAIL, // generated ethereal user
      pass: process.env.PASSWORD, // generated ethereal password
      },
    });

    contactEmail.verify((error) => {
      if (error) {
        console.log(error);
        return res.status(500).json({ error: 'Failed to verify email transport' });
      }

      console.log("Ready to Send");

      const mail = {
        from: "inforfastmove@gmail.com",
        to: needed_user_email,
        subject: 'Fast Move Bus Pass System - Account Deletion Notification',
        html: `
          <div style="background-color: #f2fff2; padding: 20px; font-family: Arial, sans-serif;">
            <div style="text-align: center;">
              <img src="https://firebasestorage.googleapis.com/v0/b/passenger-7d853.appspot.com/o/email.jpeg?alt=media&token=f7760643-e4c5-4649-a47a-00c56d3188d9" alt="Fast Move Bus Pass System Logo" style="max-width: 200px; margin-bottom: 20px;">
            </div>
            <h1 style="color: #008000; text-align: center; font-family: 'Times New Roman', serif;">Fast Move Bus Pass System</h1>
            <h2 style="color: #008000; text-align: center; font-family: 'Times New Roman', serif;">Account Deletion Notification</h2>
            <p style="font-size: 16px; color: #333; margin-bottom: 20px;">
              Dear User,<br>
              We regret to inform you that your account in the Fast Move Bus Pass System has been <span style="color: red;">Deleted</span>.
            </p>
            <p style="font-size: 16px; color: #333; margin-bottom: 20px;">
              If you believe this was done in error or have any concerns, please contact our support team at:
              <br>
              Phone: <span style="color: #008000;">0703806075</span>
              <br>
              Email: <span style="color: #008000;">fastmovebusbasssystem@gmail.com</span>
            </p>
            <p style="font-size: 16px; color: #333;">
              Thank you for being a part of the Fast Move Bus Pass System.
            </p>
            <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
            <p style="font-size: 14px; color: #666; text-align: center;">
              This email is automated. Please do not reply.
            </p>
          </div>
        `,
      };

      contactEmail.sendMail(mail, (error) => {
        if (error) {
          console.error('Error sending email:', error);
          return res.status(500).json({ error: 'Failed to send email' });
        }

        connection.query(query, [Email], (err, result) => {
          if (err) {
            console.error('Error executing DELETE query:', err);
            return res.status(500).json({ error: 'An error occurred while deleting the row' });
          }

          if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Row not found' });
          }

          return res.json({ message: 'Row deleted successfully' });
        });
      });
    });
  });
});

app.get('/Infoconductor', (req, res) => {
  const query = 'SELECT * FROM fastmove.conductor WHERE IsVerified = 1';
  connection.query(query, (err, data) => {
    if (err) {
      console.error('Error executing the query: ', err);
      return res.status(500).json({ error: 'An error occurred while fetching owner details' });
    }
    return res.json(data);
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

app.post('/passengerreply/:InquiryID/:Reply', (req, res) => {
  const InquiryID = req.params.InquiryID;
  const Reply = req.params.Reply;

  // Fetch passenger's email from the database
  const getEmailQuery = 'SELECT Email FROM fastmove.passenger_inquiry WHERE InquiryID = ?';
  connection.query(getEmailQuery, [InquiryID], (err, result) => {
    if (err) {
      console.error('Error executing the query: ', err);
      return res.status(500).json({ error: 'An error occurred while fetching the passenger email' });
    }

    if (result.length === 0) {
      return res.status(404).json({ error: 'Passenger not found' });
    }

    const passengerEmail = result[0].Email;

    // Send the reply email to the passenger
    const contactEmail = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.USER_EMAIL, // generated ethereal user
      pass: process.env.PASSWORD, // generated ethereal password
      },
    });
    

    const mailOptions = {
      from: 'your-email@gmail.com', // Update with your Gmail email
      to: passengerEmail,
      subject: 'Reply to Your Inquiry',
      text: Reply,
    };

    contactEmail.sendMail(mailOptions, (error) => {
      if (error) {
        console.error('Error sending email:', error);
        return res.status(500).json({ error: 'Failed to send email' });
      }

      // Update the database to mark the inquiry as replied
      const updateQuery = 'UPDATE fastmove.passenger_inquiry SET IsReply = 1, Reply = ? WHERE InquiryID = ?';
      connection.query(updateQuery, [Reply, InquiryID], (err, result) => {
        if (err) {
          console.error('Error executing the query: ', err);
          return res.status(500).json({ error: 'An error occurred while updating the inquiry' });
        }

        if (result.affectedRows === 0) {
          return res.status(404).json({ error: 'Inquiry not found' });
        }

        return res.json({ message: 'Reply sent successfully' });
      });
    });
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
app.get('/getpinquiries', (req, res) => {
  const query = 'SELECT * FROM fastmove.passenger_inquiry WHERE IsReply = 0';
  connection.query(query, (err, data) => {
    if (err) {
      console.error('Error executing the query: ', err);
      return res.status(500).json({ error: 'An error occurred while fetching Passenger inquiry' });
    }
    return res.json(data);
  });
});

//owner inquiry   ----------------------------------------------

app.get('/IssuesOwner', (req, res) => {
  const query = 'SELECT * FROM fastmove.inquiry_bus_owner WHERE IsReply = 0';
  connection.query(query, (err, data) => {
    if (err) {
      console.error('Error executing the query: ', err);
      return res.status(500).json({ error: 'An error occurred while fetching Passenger inquiry' });
    }
    return res.json(data);
  });
});

app.post('/Replyissues/:InquiryID/:Reply', (req, res) => {
  const InquiryID = req.params.InquiryID;
  const Reply = req.params.Reply;

  // Fetch owner's email from the database
  const getEmailQuery = 'SELECT Email FROM fastmove.inquiry_bus_owner WHERE InquiryID = ?';
  connection.query(getEmailQuery, [InquiryID], (err, result) => {
    if (err) {
      console.error('Error executing the query: ', err);
      return res.status(500).json({ error: 'An error occurred while fetching the passenger email' });
    }

    if (result.length === 0) {
      return res.status(404).json({ error: 'Passenger not found' });
    }

    const passengerEmail = result[0].Email;

    // Send the reply email to the owner
    const contactEmail = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.USER_EMAIL, // generated ethereal user
        pass: process.env.PASSWORD, // generated ethereal password
      },
    });
    

    const mailOptions = {
      from: 'your-email@gmail.com', // Update with your Gmail email
      to: passengerEmail,
      subject: 'Reply to Your Inquiry',
      text: Reply,
    };

    contactEmail.sendMail(mailOptions, (error) => {
      if (error) {
        console.error('Error sending email:', error);
        return res.status(500).json({ error: 'Failed to send email' });
      }

      // Update the database to mark the inquiry as replied
      const updateQuery = 'UPDATE fastmove.inquiry_bus_owner SET IsReply = 1, Reply = ? WHERE InquiryID = ?';
      connection.query(updateQuery, [Reply, InquiryID], (err, result) => {
        if (err) {
          console.error('Error executing the query: ', err);
          return res.status(500).json({ error: 'An error occurred while updating the inquiry' });
        }

        if (result.affectedRows === 0) {
          return res.status(404).json({ error: 'Inquiry not found' });
        }

        return res.json({ message: 'Reply sent successfully' });
      });
    });
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
    return res.json({ message: 'Passenger reply deleted successfully' });
  });
});
app.get('/getpinquiries', (req, res) => {
  const query = 'SELECT * FROM fastmove.inquiry_bus_owner WHERE IsReply = 0';
  connection.query(query, (err, data) => {
    if (err) {
      console.error('Error executing the query: ', err);
      return res.status(500).json({ error: 'An error occurred while fetching Passenger inquiry' });
    }
    return res.json(data);
  });
});

//////////////////////////// dashboard ///////////////////////////////////////////

// Route for fetching total passengers
app.get('/api/passengers', (req, res) => {
  const query = 'SELECT COUNT(*) AS totalPassengers FROM passengers';
  connection.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching total passengers: ', err);
      res.status(500).json({ error: 'Failed to fetch total passengers' });
      return;
    }
    const totalPassengers = results[0].totalPassengers;
    res.json({ totalPassengers });
  });
});

// Route for fetching total bus owners
app.get('/api/bus-owners', (req, res) => {
  const query = 'SELECT COUNT(*) AS totalBusOwners FROM bus_owners';
  connection.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching total bus owners: ', err);
      res.status(500).json({ error: 'Failed to fetch total bus owners' });
      return;
    }
    const totalBusOwners = results[0].totalBusOwners;
    res.json({ totalBusOwners });
  });
});

// Route for fetching total buses
app.get('/api/buses', (req, res) => {
  const query = 'SELECT COUNT(*) AS totalBuses FROM buses';
  connection.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching total buses: ', err);
      res.status(500).json({ error: 'Failed to fetch total buses' });
      return;
    }
    const totalBuses = results[0].totalBuses;
    res.json({ totalBuses });
  });
});

// Route for fetching total conductors
app.get('/api/conductors', (req, res) => {
  const query = 'SELECT COUNT(*) AS totalConductors FROM conductors';
  connection.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching total conductors: ', err);
      res.status(500).json({ error: 'Failed to fetch total conductors' });
      return;
    }
    const totalConductors = results[0].totalConductors;
    res.json({ totalConductors });
  });
});
//////////////////////////////////////////////
// bus fare 

// Get payment details from the database
app.get("/paymentDetails", (req, res) => {
  const query = "SELECT * FROM fastmove.PaymentDetails";

  connection.query(query, (err, data) => {
    if (err) {
      return res
        .status(500)
        .json({ error: "An error occurred while fetching payment details" });
    }

    const paymentDetails = data.map(
      ({ Payment_ID, Bus_No, User_ID, Amount, Transferred_at }) => ({
        Payment_ID,
        Bus_No,
        User_ID,
        Amount,
        Transferred_at,
      })
    );

    return res.json(paymentDetails);
  });
});

// Get Trip faires
app.get("/price", (req, res) => {
  const query = "select * from fastmove.Fare";
  connection.query(query, (err, data) => {
    if (err) {
      return res
        .status(500)
        .json({ error: "An error occurred while fetching  " });
    }

    const prices = data.map(({ id, Bus_type, minimum_prize, increment }) => ({
      id,
      Bus_type,
      minimum_prize,
      increment,
    }));

    return res.json(prices);
  });
});

//data for edit trip
app.get("/update/:id", (req, res) => {
  const query = "select * from fastmove.Fare where id=?";
  const id = req.params.id;
  connection.query(query, [id], (err, data) => {
    if (err) {
      return res
        .status(500)
        .json({ error: "An error occurred while fetching  " });
    }

    return res.json(data);
  });
});
//update trips
app.put("/updated/:id", (req, res) => {
  const query =
    "update  fastmove.Fare  set `minimum_prize` = ?,`increment` = ? where id=?";
  const id = req.params.id;
  connection.query(query, [req.body.min, req.body.inc, id], (err, data) => {
    if (err) {
      return res.status(500).json({ error: "An error occurred" });
    }
    return res.json({ updated: true });
  });
});


