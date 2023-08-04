var connection=require('../service/connection');

// Get Trip faires
exports.getPrice=async(req, res) => {
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
  };
  
