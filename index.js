const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");
const passport = require("passport")
const cookieSessoin = require('cookie-session')
require('./Controller/UserController')
// require('./config/passportConfig')

const port = process.env.PORT || 8001;

dotenv.config();

const router = require("./Routes/index");

require("./dbConnect");
const app = express();
app.use(express.urlencoded({ extended: true }))
app.use(cors());

app.use("/public", express.static("public"));
app.use(express.static(path.join(__dirname, "build")));

app.use(
  cookieSessoin({
    name:"sessoin",
    keys:['industryguru'],
    maxAge:24*60*60*100,                    
  })
);

// app.use(
//   cors({
//     origin:'http://localhost:3000',
//     credentials:true,
//   })
// )

app.use(express.json());
app.use("/api", router);
app.use(passport.initialize());
app.use(passport.session());

app.use("*", express.static(path.join(__dirname, "build")));

app.listen(port, () => {
  console.log(`Server is running at PORT ${port}`);
});
