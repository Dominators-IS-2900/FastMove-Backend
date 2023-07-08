var db=require('../service/connection')



//Get conductor activity shedule details

  exports.getshedule = async (req, res) => {
    try {
      const query = "SELECT * FROM fastmove.timetable WHERE conductorId = '1';";
      await db.query(query, values);
  
      res.status(200).json({ message: "Retrieve successful." });
    } catch (error) {
      console.error("Error:", error);
      res.status(500).json({ error: "Failed to retrieve details." });
    }
  };
  