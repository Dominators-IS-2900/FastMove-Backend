const express = require("express");
const mysql = require("mysql");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
const port = 3000;

const db = mysql.createConnection({
  host: "fastmove.cyltlmrg7fka.ap-southeast-2.rds.amazonaws.com",
  user: "admin",
  password: "Fastmove1234",
  database: "fastmove",
});

db.connect((err) => {
  if (err) {
    console.log(err);
    return;
  }
  console.log("Connected to MySQL database.");
});

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

// login for timekeeper
app.post("/login", (req, res) => {
  const { userName, password } = req.body;
  console.log(userName, password);
  const sql = "SELECT * FROM time_keeper WHERE email= ? AND password = ?";
  db.query(sql, [userName, password], (err, result) => {
    if (err) {
      console.log(err);
      res.status(500).send("Server error");
      return;
    }
    if (result) {
      if (result.length === 1) {
        let user = result[0];
        const data = {
          user: user,
          status: "success",
        };
        res.status(200).send(data);
      } else {
        res.status(400).send("User not found");
      }
    } else {
      res.status(400).send("User not found");
    }
  });
});

app.post("/profile", (req, res) => {
  const { userId } = req.body;
  const sql = "SELECT * FROM time_keeper WHERE id= ?";
  db.query(sql, [userId], (err, result) => {
    if (err) {
      res.status(500).send("Server error");
      return;
    }
    if (result) {
      if (result.length === 1) {
        let user = result[0];
        delete user.password;
        const data = {
          user: user,
          status: "success",
        };
        res.status(200).send(data);
      } else {
        res.status(400).send("Profile not found");
      }
    } else {
      res.status(400).send("Profile not found");
    }
  });
});

// Save profile
app.put("/profile/save/:userId", (req, res) => {
  const { password } = req.body;
  const { userId } = req.params;
  const sql = "UPDATE time_keeper SET password = ? WHERE id = ?";
  db.query(sql, [password, userId], (err, result) => {
    if (err) {
      console.log(err);
      res.status(500).send("Server error");
      return;
    }
    const data = {
      message: "Profile updated successfully",
      status: "success",
    };
    res.status(200).send(data);
  });
});

// // Get all time table
// app.get("/timetable/:routeId", (req, res) => {
//   const sql = "SELECT * FROM journey";
//   db.query(sql, (err, result) => {
//     if (err) {
//       console.log(err);
//       res.status(500).send("Server error");
//       return;
//     }
//     res.status(200).json(result);
//   });
// });

// // Add a new time table
// app.post("/timetable", (req, res) => {
//   const { journey_id, bus_no, route_id, income } = req.body;
//   const sql =
//     "INSERT INTO journey (journey_id, bus_no, route_id, income) VALUES (?, ?, ?, ?)";
//   db.query(sql, [journey_id, bus_no, route_id, income], (err, result) => {
//     if (err) {
//       console.log(err);
//       res.status(500).send("Server error");
//       return;
//     }
//     res.status(201).send("Journey added successfully");
//   });
// });

// // Update a time table
// app.put("/timetable/:timetableId", (req, res) => {
//   const { bus_no, route_id, income } = req.body;
//   const { journey_id } = req.params;
//   const sql =
//     "UPDATE journey SET bus_no = ?, route_id = ?, income = ? WHERE journey_id = ?";
//   db.query(sql, [bus_no, route_id, income, journey_id], (err, result) => {
//     if (err) {
//       console.log(err);
//       res.status(500).send("Server error");
//       return;
//     }
//     res.status(200).send("Journey updated successfully");
//   });
// });

// // Delete a timetable
// app.delete("/timetable/:timetableId", (req, res) => {
//   const { journey_id } = req.params;
//   const sql = "DELETE FROM journey WHERE journey_id = ?";
//   db.query(sql, [journey_id], (err, result) => {
//     if (err) {
//       console.log(err);
//       res.status(500).send("Server error");
//       return;
//     }
//     res.status(200).send("Journey deleted successfully");
//   });
// });

// Get all time table
app.get("/depo", (req, res) => {
  const sql = "SELECT * FROM depo";
  db.query(sql, (err, result) => {
    if (err) {
      console.log(err);
      res.status(500).send("Server error");
      return;
    }
    res.status(200).json(result);
  });
});

// Add a new depo
app.post("/depo", (req, res) => {
  const { name, district, contactNumber } = req.body;
  const sql =
    "INSERT INTO depo (name, district, contact_number) VALUES (?, ?, ?)";
  db.query(sql, [name, district, contactNumber], (err, result) => {
    if (err) {
      console.log(err);
      res.status(500).send("Server error");
      return;
    }
    const data = {
      message: "Depo added successfully",
      status: "success",
    };
    res.status(200).send(data);
  });
});

// Update a depo
app.put("/depo/:depoId", (req, res) => {
  const { name, district, contactNumber } = req.body;
  const { depoId } = req.params;
  const sql =
    "UPDATE depo SET name = ?, district = ?, contact_number = ? WHERE id = ?";
  db.query(sql, [name, district, contactNumber, depoId], (err, result) => {
    if (err) {
      console.log(err);
      res.status(500).send("Server error");
      return;
    }
    const data = {
      message: "Depo updated successfully",
      status: "success",
    };
    res.status(200).send(data);
  });
});

// Delete a depo
app.delete("/depo/:depoId", (req, res) => {
  const { depoId } = req.params;
  const sql = "DELETE FROM depo WHERE id = ?";
  db.query(sql, [depoId], (err, result) => {
    if (err) {
      console.log(err);
      res.status(500).send("Server error");
      return;
    }
    const data = {
      message: "Depo deleted successfully",
      status: "success",
    };
    res.status(200).send(data);
  });
});

// Get all conductors for dropdown
app.get("/conductor", (req, res) => {
  const { type } = req.params;
  const sql =
    "SELECT  conductor_id as conductorId,user_name as userName FROM conductor_profiles";
  db.query(sql, [type], (err, result) => {
    if (err) {
      console.log(err);
      res.status(500).send("Server error");
      return;
    }
    res.status(200).json(result);
  });
});

// Get all bus for dropdown
app.get("/bus", (req, res) => {
  const { type } = req.params;
  const sql = "SELECT * FROM Bus_Registration";
  db.query(sql, [type], (err, result) => {
    if (err) {
      console.log(err);
      res.status(500).send("Server error");
      return;
    }
    res.status(200).json(result);
  });
});

// Get all routes for dropdown
app.get("/routes", (req, res) => {
  const { type } = req.params;
  const sql = "SELECT * FROM routes";
  db.query(sql, [type], (err, result) => {
    if (err) {
      console.log(err);
      res.status(500).send("Server error");
      return;
    }
    res.status(200).json(result);
  });
});

// Get all time keeping
app.get("/timekeeping/:type", (req, res) => {
  const { type } = req.params;
  const sql =
    "SELECT * FROM timekeeping inner join routes on timekeeping.routeId = routes.route_id where type=?";
  db.query(sql, [type], (err, result) => {
    if (err) {
      console.log(err);
      res.status(500).send("Server error");
      return;
    }
    res.status(200).json(result);
  });
});

// Add a new time keeping
app.post("/timekeeping/:type", (req, res) => {
  const { arrivalDepartureDateTime, busNo, routeId } = req.body;
  const { type } = req.params;
  const sql =
    "INSERT INTO timekeeping (type,arrivalDepartureDateTime, busNo, routeId) VALUES (?, ?, ?,?)";
  db.query(
    sql,
    [type, arrivalDepartureDateTime, busNo, routeId],
    (err, result) => {
      if (err) {
        console.log(err);
        res.status(500).send("Server error");
        return;
      }
      const data = {
        message: "Time keeping added successfully",
        status: "success",
      };
      res.status(200).send(data);
    }
  );
});

// Update a time keeping
app.put("/timekeeping/:id", (req, res) => {
  const { arrivalDepartureDateTime, busNo, routeId } = req.body;
  const { id } = req.params;
  const sql =
    "UPDATE timekeeping SET arrivalDepartureDateTime = ?, busNo = ?, routeId = ? WHERE id = ?";
  db.query(
    sql,
    [arrivalDepartureDateTime, busNo, routeId, id],
    (err, result) => {
      if (err) {
        console.log(err);
        res.status(500).send("Server error");
        return;
      }
      const data = {
        message: "Time keeping updated successfully",
        status: "success",
      };
      res.status(200).send(data);
    }
  );
});

// Delete a time keeping
app.delete("/timekeeping/:id", (req, res) => {
  timetable;
  const { id } = req.params;
  const sql = "DELETE FROM timekeeping WHERE id = ?";
  db.query(sql, [id], (err, result) => {
    if (err) {
      console.log(err);
      res.status(500).send("Server error");
      return;
    }
    const data = {
      message: "Time keeping deleted successfully",
      status: "success",
    };
    res.status(200).send(data);
  });
});

// Get all time table
app.get("/timetable/:routeId", (req, res) => {
  const { routeId } = req.params;
  const sql =
    "SELECT timetable.id,timetable.routeId,timetable.busId,timetable.conductorId,timetable.startDateTime,timetable.endDateTime,conductor_profiles.user_name FROM timetable inner join conductor_profiles on conductor_profiles.conductor_id = timetable.conductorId where timetable.routeId=?";
  db.query(sql, [routeId], (err, result) => {
    if (err) {
      res.status(500).send("Server error");
      return;
    }
    res.status(200).json(result);
  });
});

// Add a new time table
app.post("/timetable/:routeId", (req, res) => {
  const { startDateTime, endDateTime, busId, conductorId } = req.body;
  const { routeId } = req.params;
  const sql =
    "INSERT INTO timetable (busId,routeId, conductorId,startDateTime,endDateTime) VALUES (?,?,?,?,?)";
  db.query(
    sql,
    [busId, routeId, conductorId, startDateTime, endDateTime],
    (err, result) => {
      if (err) {
        res.status(500).send("Server error");
        return;
      }
      const data = {
        message: "Timetable added successfully",
        status: "success",
      };
      res.status(200).send(data);
    }
  );
});

// Update a time table
app.put("/timetable/:id", (req, res) => {
  const { startDateTime, endDateTime, busId, conductorId } = req.body;
  const { id } = req.params;
  const sql =
    "UPDATE timetable SET startDateTime = ?,endDateTime= ?, busId = ?, conductorId =? WHERE id = ?";
  db.query(
    sql,
    [startDateTime, endDateTime, busId, conductorId, id],
    (err, result) => {
      if (err) {
        console.log(err);
        res.status(500).send("Server error");
        return;
      }
      const data = {
        message: "Time table updated successfully",
        status: "success",
      };
      res.status(200).send(data);
    }
  );
});

// Delete a time table
app.delete("/timetable/:id", (req, res) => {
  const { id } = req.params;
  const sql = "DELETE FROM timetable WHERE id = ?";
  db.query(sql, [id], (err, result) => {
    if (err) {
      console.log(err);
      res.status(500).send("Server error");
      return;
    }
    const data = {
      message: "Time table deleted successfully",
      status: "success",
    };
    res.status(200).send(data);
  });
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}.`);
});
