var connection=require('../service/connection')

//get bus Bus registration details from database
exports.getBus=async (req, res) => {
    var p= "SELECT * FROM fastmove.Bus_Registration;";
    connection.query(p, (err, data) => {
      if (err) return res.json(err);
      return res.json(data);
    });
  };


  
//register new bus 
exports.addBus=async (req, res) => {
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
    };
    

    //update bus lisence
exports.updateLicense=async(req, res) => {
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
  };