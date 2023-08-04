const express = require("express");
const router = express.Router();
const busOwnerController=require("../controllers/busOwnerController");
const busController =require("../controllers/busController")

router.route('/getbus').get(busController.getBus);
router.route('/paymentDetails').get(busOwnerController.paymentDetails)
router.route('/currentRevenue').get(busOwnerController.currentRevenue)

router.route('/addBus').post(busController.addBus);
router.route('/updateLicense').post(busController.updateLicense);
router.route('/inquiry').post(busOwnerController.inquiryOwner);
router.route('/setAccount').post(busOwnerController.setAccountDetails);
router.route('/addBus').post(busController.addBus);
router.route('/viewacc').get(busOwnerController.AccountDetails)



module.exports=router;

