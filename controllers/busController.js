var connection=require('../service/connection')

//get bus Bus registration details from database
exports.getBus=async (req, res) => {
    var p= "SELECT * FROM fastmove.Bus_Registration;";
    connection.query(p, (err, data) => {
      if (err) return res.json(err);
      return res.json(data);
    });
  };


  
  exports.addBus = async (req, res) => {
    const data = req.body;
    console.log(data);
    const q = "INSERT INTO fastmove.Bus_Registration(`Bus_No`,`Email`,`Bus_type`,`No_ofSeats`,`Bus_Lisence_startDate`,`Bus_Lisence_expireDate`, `BusLisence_scancopy`) VALUES (?,?,?,?,?,?,?)";
  
    const startDate = new Date(req.body.Bus_Lisence_startDate);
    const expireDate = new Date(startDate);
    expireDate.setMonth(expireDate.getMonth() + 12);
  
    const values = [
      req.body.Bus_No,
      req.body.UserEmail,
      req.body.Bus_type,
      req.body.No_ofSeats,
      startDate.toISOString().slice(0, 10),
      expireDate.toISOString().slice(0, 10),
      req.body.BusLisence_scancopy
    ];
  
    connection.query(q, values, (err, data) => {
      if (err) {
        console.log(err);
        return res.json(err);
      }
      return res.json("Bus has been added successfully");
    });
  
    console.log(values);
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