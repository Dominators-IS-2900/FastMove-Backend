const express = require("express");
const router = express.Router();
const payoutController=require("../controllers/payoutController")

router.route('/').post(payoutController.payout); // post payout


module.exports = router;
