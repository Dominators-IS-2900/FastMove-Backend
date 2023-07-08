//bus owner inquiries
exports.inquiryOwner=async (req, res) => {
    const s = "INSERT INTO inquiry_bus_owner (`UserID`, `type_of_issue`, `complain`) VALUES (NULL, ?, ?)";
    const values = [
      req.body.type_of_issue,
      req.body.complain
    ];
    connection.query(s, values, (err, data) => {
      if (err) {
        return res.json(err);
      }
      return res.json({ message: "Inquiry is submitted successfully" });
    });
  };
  
  
//account details saving
exports.setAccountDetails=async(req,res)=>{
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
  };
  