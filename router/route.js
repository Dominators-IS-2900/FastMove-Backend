const express = require('express');
const router = express.Router();
const cors = require("cors");


/** import all controllers */
const { verifyUser, getUser, register, login, resetPassword, generateOTP,verifyOTP, createResetSession, registerValidate , updateUser}= require('../controllers/appController.js');
const registerMail=require("../controllers/RegisterMail.js");
const {Auth} = require('../middleware/auth.js');
const {localVariables} = require('../middleware/auth.js');





/** POST Methods */
router.route('/register').post(register); // register user
router.route('/registerMail').post(registerMail); // send the email
router.route('/authenticate').post(verifyUser,(req, res) => res.end()); // authenticate user
router.route('/login').post(verifyUser,login); // login in app
// router.route('/addBus').post(busController.addBus);
// router.route('/payout').post(payoutController.payout)

/** GET Methods */
router.route('/user').get(getUser) // user with username
router.route('/generateOTP').get(verifyUser, localVariables, generateOTP) // generate random OTP
router.route('/verifyOTP').get(verifyUser, verifyOTP) // verify generated OTP
router.route('/createResetSession').get(createResetSession) // reset all the variables
router.route('/registerOTP').get(localVariables,generateOTP)
router.route('/verifyRegisterOTP').get(verifyOTP) // verify generated OTP
router.route('/verifyuserEmail').get(registerValidate) // verify generated OTP

/** PUT Methods */
 router.route('/updateuser').put(Auth, updateUser); // is use to update the user profile
router.route('/resetPassword').put(verifyUser, resetPassword); // use to reset password



module.exports= {router};