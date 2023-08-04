var connection=require('../service/connection');

const stripe = require("stripe")(
    "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"
  );
  
exports.payout= async (req, res) => {
    const { amount, recipientUserId } = req.body;
  console.log(amount)
  console.log(recipientUserId)
    try {
      const payout = await makePayout(amount, recipientUserId);
      res.json({ success: true, payout });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  };

  async function makePayout(amount, recipientUserId) {
    try {
      const bankDetails = await getBankDetails(recipientUserId);
      console.log(bankDetails)
  
      if (!bankDetails) {
        throw new Error("Bank details not found for the recipient user");
      }
  
      const payout = await stripe.payouts.create({
        amount: amount,
        currency: "usd",
        method: "instant",
        destination: bankDetails.Account_No,
      });
  
      console.log("Payout successful:", payout);
      return payout;
    } catch (error) {
      console.error("Payout error:", error);
      throw error;
    }
  }

  async function getBankDetails(userId) {
    try {
      const query = "SELECT * FROM fastmove.BankDetails WHERE Email = ?";
      const values = [userId];
  
      const result = await new Promise((resolve, reject) => {
        connection.query(query, values, function (err, result, fields) {
          if (err) {
            reject(err);
          } else {
            resolve(result);
          }
        });
      });
  
      if (!result.length > 0) {
        throw new Error("Couldn't find Bank Details");
      }
  
      const bankDetails = result[0];
      console.log(bankDetails);
  
      return bankDetails;
    } catch (error) {
      console.error("Error retrieving bank details:", error);
      throw error;
    }
  }
  
  