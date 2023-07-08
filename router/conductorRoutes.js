const express = require("express");
const router = express.Router();
const conductorController = require("../controllers/conductorController");

router.get("/:email", conductorController.getConductor);
router.put("/:email", conductorController.updateConductor);

module.exports = router;
