const express = require("express");
const router = express.Router();
const emergencyController = require("../controllers/conductorshedule")

router.get("/", emergencyController.getshedule);

module.exports = router;
