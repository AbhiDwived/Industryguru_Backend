const User = require("../Models/User");
const fs = require("fs");
const bcrypt = require("bcrypt");
const passwordValidator = require("password-validator");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  tls: true,
  auth: {
    user: process.env.EMAIL_SENDER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

var schema = new passwordValidator();
schema
  .is()
  .min(8) // Minimum length 8
  .is()
  .max(100) // Maximum length 100
  .has()
  .uppercase(1) // Must have uppercase letters
  .has()
  .lowercase(1) // Must have lowercase letters
  .has()
  .digits(1) // Must have at least 2 digits
  .has()
  .not()
  .spaces() // Should not have spaces
  .is()
  .not()
  .oneOf(["Passw0rd", "Password123", "Admin123", "Qwerty@123"]); // Blacklist these values

async function createUser(req, res) {
  if (schema.validate(req.body.password)) {
    var data = new User(req.body);
    bcrypt.hash(req.body.password, 12, async (error, hash) => {
      if (error) res.send({ result: "Fail", error: error });
      else {
        try {
          data.password = hash;
          await data.save();
          res.send({
            result: "Done",
            message: "Record is Created!!!",
            data: data,
          });
        } catch (error) {
          if (error.keyValue)
            res.send({
              result: "Fail",
              message: "User Name Must Be Unique!!!",
            });
          else if (error.errors.name)
            res.send({ result: "Fail", message: error.errors.name.message });
          else if (error.errors.username)
            res.send({
              result: "Fail",
              message: error.errors.username.message,
            });
          else if (error.errors.email)
            res.send({ result: "Fail", message: error.errors.email.message });
          else if (error.errors.phone)
            res.send({ result: "Fail", message: error.errors.phone.message });
          else if (error.errors.password)
            res.send({
              result: "Fail",
              message: error.errors.password.message,
            });
          else
            res
              .status(500)
              .send({ result: "Fail", message: "Internal Server Error!!!" });
        }
      }
    });
  } else
    res.send({
      result: "Fail",
      message:
        "Passwod Length Must Be Greater or Equal to 8 and Less Then or Eqal to 100, It Must Coontains Atleast 1 Digit,1 Upper Case Character, 1 Lower Case Characer and It Can't Contain any Space!!!",
    });
}
async function getAllUser(req, res) {
  try {
    var data = await User.find().sort({ _id: -1 });
    res.send({ result: "Done", count: data.length, data: data });
  } catch (error) {
    res
      .status(500)
      .send({ result: "Fail", message: "Internal Server Error!!!" });
  }
}
async function getSingleUser(req, res) {
  try {
    var data = await User.findOne({ _id: req.params._id });
    if (data) res.send({ result: "Done", data: data });
    else res.send({ result: "Fail", message: "Invalid Id!!!" });
  } catch (error) {
    res
      .status(500)
      .send({ result: "Fail", message: "Internal Server Error!!!" });
  }
}

async function updateUser(req, res) {
  try {
    var data = await User.findOne({ _id: req.params._id });
    if (data) {
      data.name = req.body.name ?? data.name;
      data.email = req.body.email ?? data.email;
      data.phone = req.body.phone ?? data.phone;
      data.addressline1 = req.body.addressline1 ?? data.addressline1;
      data.addressline2 = req.body.addressline2 ?? data.addressline2;
      data.addressline3 = req.body.addressline3 ?? data.addressline3;
      data.pin = req.body.pin ?? data.pin;
      data.city = req.body.city ?? data.city;
      data.state = req.body.state ?? data.state;

      data.pan = req.body.pan ?? data.pan;
      data.bank_no = req.body.bank_no ?? data.bank_no;
      data.bank_ac_name = req.body.bank_ac_name ?? data.bank_ac_name;
      data.bank_ifsc = req.body.bank_ifsc ?? data.bank_ifsc;
      data.bank_branch = req.body.bank_branch ?? data.bank_branch;
      data.bank_name = req.body.bank_name ?? data.bank_name;
      data.upi = req.body.upi ?? data.upi;

      try {
        if (req.file.filename && data.pic)
          fs.unlinkSync("public/users/" + data.pic);

        data.pic = req.file.filename;
      } catch (error) { }

      await data.save();
      res.send({ result: "Done", message: "Record is Updated!!!" });
    } else res.send({ result: "Fail", message: "Invalid Id!!!" });
  } catch (error) {
    if (error.keyValue)
      res.send({ result: "Fail", message: "Name Must Be Unique!!!" });
    else
      res
        .status(500)
        .send({ result: "Fail", message: "Internal Server Error!!!" });
  }
}
async function deleteUser(req, res) {
  try {
    await User.deleteOne({ _id: req.params._id });
    res.send({ result: "Done", message: "Record is Deleted!!!" });
  } catch (error) {
    res
      .status(500)
      .send({ result: "Fail", message: "Internal Server Error!!!" });
  }
}
async function login(req, res) {
  try {
    console.log(req.body)
    var data = await User.findOne({ username: req.body.username });
    console.log(data)
    if (data) {
      if (await bcrypt.compare(req.body.password, data.password)) {
        let key;
        if (data.username == "libinprasanth") {
          key = process.env.JWT_ADMIN_KEY;
          data.role = "Admin";
        } else if (data.role === "User") {
          key = process.env.JWT_BUYER_KEY;
          
          // serialize and Deserialize User////////////////
          passport.serializeUser((user, done) => {
            done(null, user)
          });
          passport.deserializeUser((user, done) => {
            done(null, user)
          });
          // configer Google 0Auth Stragy
          passport.use(
            new GoogleStrategy(
              {
                clientID: process.env.GOOGLE_CLIENT_ID,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                callbackURL: "http://localhost:8001/google",
              },
              (accessToken,refreshToken,profile,done) =>{
                done(null,profile);
              }
            )
          )
        } else if (data.role === "Admin") {
          key = process.env.JWT_ADMIN_KEY;
        } else if (data.role === "Vendor") {
          // if ( !data.verified ) {
          //   res.send({
          //     result: "Fail",
          //     message: "Your profile not verified!!!",
          //   });
          // }
          key = process.env.JWT_VENDOR_KEY;
        }
        jwt.sign({ data }, key, (error, token) => {
          if (error)
            res.status(500).send({
              result: "Fail",
              message: "Internal Server Error!!!",
              error: error,
            });
          else res.send({ result: "Done", data: data, token: token });
        });
      } else
        res.send({
          result: "Fail",
          message: "Invalid Username or Password1!!!",
        });
    } else
      res.send({ result: "Fail", message: "Invalid Username or Password!2!!" });
  } catch (error) {
    res
      .status(500)
      .send({ result: "Fail", message: "Internal Server Error3!!!" });
  }
}

async function forgetPassword1(req, res) {
  try {
    var data = await User.findOne({ username: req.body.username });
    if (data) {
      var otp = parseInt(Math.random() * 1000000);
      data.otp = otp;
      await data.save();

      const mailOptions = {
        from: process.env.EMAIL_SENDER,
        to: data.email,
        subject: "OTP For Password Reset!!! : Team ECOM",
        text: `
                    OTP for Password Reset is ${otp}
                    Team : Team ECOM
                `,
      };
      transporter.sendMail(mailOptions, (error) => {
        console.log(error);
      });
      res.send({
        result: "Done",
        message: "OTP Has Been Sent to Your Registered Email ID!!!",
      });
    } else res.send({ result: "Fail", message: "Username Not Found!!!" });
  } catch (error) {
    // console.log(error);
    res
      .status(500)
      .send({ result: "Fail", message: "Internal Server Error!!!" });
  }
}

async function forgetPassword2(req, res) {
  try {
    var data = await User.findOne({ username: req.body.username });
    if (data) {
      if (data.otp == req.body.otp)
        res.send({ result: "Done", message: "OTP Matched!!!" });
      else res.send({ result: "Done", message: "Invalid OTP!!!" });
    } else res.send({ result: "Fail", message: "UnAuthorized Activity!!!" });
  } catch (error) {
    // console.log(error);
    res
      .status(500)
      .send({ result: "Fail", message: "Internal Server Error!!!" });
  }
}

async function forgetPassword3(req, res) {
  try {
    var data = await User.findOne({ username: req.body.username });
    if (data) {
      if (schema.validate(req.body.password)) {
        bcrypt.hash(req.body.password, 12, async (error, hash) => {
          if (error) res.send({ result: "Fail", error: error });
          else {
            data.password = hash;
            await data.save();
            res.send({ result: "Done", message: "Password is Updated!!!" });
          }
        });
      } else
        res.send({
          result: "Fail",
          message:
            "Passwod Length Must Be Greater or Equal to 8 and Less Then or Eqal to 100, It Must Coontains Atleast 1 Digit,1 Upper Case Character, 1 Lower Case Characer and It Can't Contain any Space!!!",
        });
    } else res.send({ result: "Fail", message: "UnAuthorized Activity!!!" });
  } catch (error) {
    // console.log(error);
    res
      .status(500)
      .send({ result: "Fail", message: "Internal Server Error!!!" });
  }
}
module.exports = [
  createUser,
  getAllUser,
  getSingleUser,
  updateUser,
  deleteUser,
  login,
  forgetPassword1,
  forgetPassword2,
  forgetPassword3,
];
