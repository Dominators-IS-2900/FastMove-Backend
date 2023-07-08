var db=require('../service/connection')

// Retrieve
// Get conductor details
exports.getConductor = async (req, res) => {
  try {
    const query = "SELECT * FROM fastmove.conductor WHERE email = 'hnwanniarachchi98@gmail.com';";
    await db.query(query, (err, data) => {
      if (err) return res.json(err);
      return res.json(data);
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve conductor details" });
  }
};

exports.updateConductor = async (req, res) => {
  const { conductorId } = req.params;
  const { conductor_name, nic, conductor_no, age, email, conductor_license } =
    req.body;

  try {
    const query = `
      UPDATE conductors
      SET conductor_name = ?, nic = ?, conductor_no = ?, age = ?, email = ?, conductor_license = ?
      WHERE id = ?
    `;
    const values = [
      conductor_name,
      nic,
      conductor_no,
      age,
      email,
      conductor_license,
      conductorId,
    ];
    await db.query(query, values);

    res.status(200).json({ message: "Conductor updated successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to update conductor" });
  }
};
