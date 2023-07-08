const nodemailer = require("nodemailer");
const Mailgen  = require("mailgen")
const dotenv = require("dotenv");
dotenv.config(); //npm i dotenv

let nodeConfig = {
    // host: "smtp.ethereal.email",
    // port: 587,
    // secure: false, // true for 465, false for other ports
    service: 'gmail',
    auth: {
      user: process.env.USER_EMAIL, // generated ethereal user
      pass: process.env.PASSWORD, // generated ethereal password
    }
}

let transporter = nodemailer.createTransport(nodeConfig);

let MailGenerator = new Mailgen({
    theme:"default",
    product:{
        name:"Fastmove",
        link:"http://localhost:3000/"
    }
})

const registerMail = async (req,res)=>{
    const {name, userEmail, text, subject} = req.body;   

    //email body
    var email = {
        body:{
            name:name,
            intro : text || 'Welcome to Fastmove Bus pass system! We\'re very excited to have you on board.',
            outro: 'This is a generated mail. Please do not reply to this.'       
         }
    }
    var emailBody = MailGenerator.generate(email);

    let message = {
        from: "inforfastmove@gmail.com",
        to: userEmail,
        subject: subject || "subject",
        html: emailBody
    }

    //send mail
    transporter.sendMail(message)
    .then(()=>{
        return res.status(200).send({msg: "You should recieved an email from us"})
    })
    .catch(error=>res.status(500).send({error}))
}


module.exports=registerMail;