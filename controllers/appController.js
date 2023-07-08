
const jwt = require("jsonwebtoken");
const otpGenerator = require("otp-generator");
var connection=require('../service/connection');
const bcrypt = require('bcrypt');
const { table } = require("console");
const dotenv = require("dotenv");
dotenv.config(); //npm i dotenv
const bodyParser = require('body-parser');




/** middleware for verify user */
async function verifyUser(req, res, next) {
  const  values  = req.method == "GET" ? req.query : req.body;
   console.log(values) 
  var table=null;
  

  if(values.user_type=="Passenger"){
    table="fastmove.passenger"
  }
  else if(values.user_type=="bus owner"){
    table="fastmove.busowner"
  }
  else if(values.user_type=="conductor"){
    table= "fastmove.conductor"
  }
  else if(values.user_type=="admin"){
    table= "fastmove.admin"
  }
  
  const email=values.username;


  
  const sql = `SELECT * from ${table} where Email =?`;
  // console.log(sql);
  
  try {
    connection.query(sql, email, function (err, result, fields) {
      if (err) {
        console.log(err);
        return res.status(500).send(err);
      } else {
        if (!result.length > 0) {
          return res.status(201).send({ error: "Can't find the user" });
        } else {
          next();
          let status=200;
          return status;
        }
      }
    });
  } catch (error) {
    return res.status(404).send({ msg: "Authentication Error", error });
  }
}



async function register(req, res) {
  const data = req.body;
 console.log(data)
 
  const hashedPassword = await bcrypt.hash(data.password, 10);    
  var table=null;
  var verified=0;

  if(data.user_type=="Passenger"){
    table="fastmove.passenger"
  }
  else if(data.user_type=="bus owner"){
    table="fastmove.busowner"
  }
  else if(data.user_type=="conductor"){
    table= "fastmove.conductor"
  }

  else if(data.user_type=="admin"){
    table= "fastmove.admin"
  }

const user_register_sql =
  `INSERT INTO ${table} (Email, FName, LName, Password, Contact_No, address, IsVerified, ID_scancopy) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

  const values=[data.email,data.fname,data.lname,hashedPassword, data.contactno, data.address, verified, data.ID];
  
  try {
    connection.query(user_register_sql, values,function (err, result, fields) {
      if (err) {
        console.log(err);
        return res.status(500).send(err);
      } else {
        const token = jwt.sign(
          {
            username: data.email,
            user_type:data.user_type
          },
          process.env.JWT_SECRET_KEY,
        
          { expiresIn: '24h' }
        );
        return res.status(201).send({ msg: 'User Register successful!', token });
      }
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ error });
  }
}



async function login(req, res) {
  const data = req.body;
 console.log(data)

  var table=null;
  

  if(data.user_type=="Passenger"){
    table="fastmove.passenger"
  }
  else if(data.user_type=="bus owner"){
    table="fastmove.busowner"
  }
  else if(data.user_type=="conductor"){
    table= "fastmove.conductor"
  }
  else if(data.user_type=="admin"){
    table= "fastmove.admin"
  }

  const sql =
    `SELECT * from ${table} where Email = ?`;

    const values=[data.username]

  connection.query(sql,values ,function (err, result, fields) {
    if (err) {
      console.log(err);
      return res.status(500).send({ error: err });
    }

    if (result.length > 0) {
      const encryptedPassword = result[0].Password;
      const User_entered_PW=data.password;
    

      bcrypt.compare(User_entered_PW, encryptedPassword, function (err, passwordMatch) {
        if (err) {
          console.log(err);
          return res.status(500).send({ error: err });
        }
        

        if (passwordMatch) {
          const token = jwt.sign(
            {
              username: result[0].Email,
              user_type:data.user_type
            },
            process.env.JWT_SECRET_KEY,
          
            { expiresIn: '24h' }
          );
          

          return res.status(200).send({ msg: 'Login successful!', token });
        } else {
          
          return res.status(303).send({ error: 'Password did not match' });
        }
      });
    } else {
      console.log("");
      return res.status(404).send({ error: 'Entered email does not exist' });
    }
  });
}


async function getUser(req, res) {
  const value= req.method == "GET" ? req.query : req.body;
  const email=value.username;
 
  
  var table=null;
  

  if(value.user_type=="Passenger"){
    table="fastmove.passenger"
  }
  else if(value.user_type=="bus owner"){
    table="fastmove.busowner"
  }
  else if(value.user_type=="conductor"){
    table= "fastmove.conductor"
  }
 
  
  try {
    if (!email) return res.status(501).send({ error: "Invalid email" });
    const sql =
      `SELECT * from ${table} where Email =?`;
    connection.query(sql,email, function (err, result, fields) {
      if (err) {
        console.log(err);
        res.status(500).send({ err });
      } else {
        if (!result.length > 0) {
          return res.status(501).send({ error: "Could't find a user" });
        } else {
          const { Password, ...rest } = result[0];

          return res.status(201).send(rest);
        }
      }
    });
  } catch (error) {
    return res.status(500).send({ error: error });
  }
}

async function generateOTP(req, res) {
  req.app.locals.OTP = otpGenerator.generate(4, {
    lowerCaseAlphabets: false,
    upperCaseAlphabets: false,
    specialChars: false,
  });
  //console.log(OTP);
  res.status(201).send({ code: req.app.locals.OTP, msg: "OTP" });
}

async function verifyOTP(req, res) {
  const { code } = req.query;
  
  //console.log(req.app.locals.OTP);
  if (parseInt(req.app.locals.OTP) === parseInt(code)) {
    req.app.locals.OTP = null; // reset the OTP value
    req.app.locals.otpSession = true; // start session for reset password
    return res.status(201).send({ msg: "Verify Successsfully!" });
  }
  return res.status(400).send({ error: "Invalid OTP" });
}

async function createResetSession(req, res) {
  if (req.app.locals.otpSession) {
    req.app.locals.otpSession = false;
    return res.status(201).send({ msg: "access granted!" });
  }
  return res.status(440).send({ msg: "Session expired" });
}

async function resetPassword (req,res){
  const { username,user_type, password } = req.body;
  console.log(username,user_type, password)
  const hashedPassword = await bcrypt.hash(password, 10);
  var table=null;
  

  if(user_type=="Passenger"){
    table="fastmove.passenger"
  }
  else if(user_type=="bus owner"){
    table="fastmove.busowner"
  }
  else if(user_type=="conductor"){
    table= "fastmove.conductor"
  }
  const sql = `UPDATE ${table} SET Password = ?  WHERE (Email = ?)`
  const value = [hashedPassword, username];
  connection.query(sql, value, function (err, result, fields) {
    if (err) {
      console.log(err);
      res.status(500).send({ err });
    } else {
     return res.status(201).send("Password has been reset")
    }
  })
}

async function registerValidate(req, res) {
  const user = req.query;
  let table = null;
 


  if (user.user_type == 'Passenger') {
    table = "fastmove.passenger";
  } else if (user.user_type == "bus owner") {
    table = "fastmove.busowner";
  } else if (user.user_type == "conductor") {
    table = "fastmove.conductor";
  }

  const exist_email_sql = `SELECT Email from ${table} where Email = ?`;
  const values = user.email;

  try {
    connection.query(exist_email_sql, values, function (exist_email_err, result_check_email, fields) {
      
      if (exist_email_err) {
        res.status(200).send(exist_email_err);
      } else {
        if (result_check_email.length > 0) {
          console.log(result_check_email)
          
          return res.status(200).send("This email is already registered. Please login in.");
        } else {
          return res.status(201).send("Email is valid");
        }
      }
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ error });
  }
}


module.exports = { verifyUser, getUser, register, login, resetPassword, generateOTP,verifyOTP,  createResetSession, registerValidate};

