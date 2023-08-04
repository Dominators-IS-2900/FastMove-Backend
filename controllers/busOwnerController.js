var connection=require('../service/connection')
//bus owner inquiries
exports.inquiryOwner=async (req, res) => {
    const s = "INSERT INTO inquiry_bus_owner (`Email`,  `complain`,`IsReply`) VALUES (?, ?,0)";
    const values = [

      req.body.Email,
      req.body.complain
    ];
    connection.query(s, values, (err, data) => {
      if (err) {
        return res.json(err);
      }
      return res.json({ message: "Inquiry is submitted successfully" });
    });
  };
  
  exports.setAccountDetails = async (req, res) => {
    const data = req.body;
    console.log(data);
    const Email = data.userID;
    //const Account_No=
  
    const ac = `INSERT INTO fastmove.BankDetails (Email, Bank, Branch, Account_No) VALUES ((SELECT Email FROM busowner WHERE Email = '${Email}'), ?, ?, ?)`;
    const values = [data.bank, data.branch, data.accountNo];
    console.log(values);
  
    connection.query(ac, values, (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "Failed to save Bank Details" });
      }
      return res.status(200).json({ message: "Saved Bank Details successfully" });
    });
  };
  
  exports.paymentDetails = async (req, res) => {
    const rev = "SELECT * FROM fastmove.PaymentDetails";
    connection.query(rev, (err, data) => {
      if (err) return res.json(err);
      return res.json(data);
    });
  };
  

  exports.paymentDetails=async(req, res) => {
    var rev = "SELECT * FROM fastmove.PaymentDetails;";
    connection.query(rev, (err, data) => {
      if (err) return res.json(err);
      return res.json(data);
    });
  };
  

  exports.currentRevenue=async(req, res) => {
    const query = "SELECT SUM(Amount) AS total FROM fastmove.PaymentDetails";
    
    connection.query(query, (err, data) => {
      if (err) {
        return res.json(err);
      }
      
      const totalAmount = data[0].total;
      
      return res.json({ totalAmount });
    });
  };

  exports.AccountDetails=async (req, res) => {
    const acc="SELECT * FROM fastmove.BankDetails"
    connection.query(acc,(err, data) => {
      if (err) return res.json(err);
      return res.json(data);
    });
  }