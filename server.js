import express, { response } from "express";
import {dirname, join} from "path";
import { fileURLToPath } from "url";
import axios from "axios";
import mongoose from "mongoose";
import passport from "passport"
import { Strategy } from "passport-local"
import GoogleStrategy from 'passport-google-oauth2'
import session from "express-session";
import env from "dotenv";
import nodemailer from "nodemailer";

//Please work;

env.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = process.env.PORT || 4000;
const uri = process.env.URI;
const API_URL = process.env.TVC_DATABASE;
const BIBLE_URL = process.env.BIBLE_API;

app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(express.json());

// const welcomeEmail = ;


const transporter = nodemailer.createTransport({
  service: process.env.TRANSPORTER_SERVICE,
  auth: {
    user: process.env.TRANSPORTER_USER,
    pass: process.env.TRANSPORTER_PASS,
  }
})

const sendWelcomeEmail = (to, username) => {

  const mailOptions = {
    from: "kayskidadenusi@gmail.com",
    to: to,
    subject: "Welcome to TVC",
    text: `Dear ${username},

            Welcome to the TVC family! We’re excited to have you with us.

            With the TVC app, you can:

            - Access weekly sermons
            - Stay updated on events
            - Share prayer requests
            - Explore resources

            If you have any questions, reach out at tvc@gmail.com or visit https://tvc.onrender.com. 

            We look forward to growing together!

            Blessings,  
            TVC admininstration,  
            TVC.
            `,
      }

  transporter.sendMail(mailOptions, (error, info) => {
    if(error){
      return console.log(error);
    }
    console.log(`Email sent: ${info.response}`);
  })
}

const sendLoginAlert = (to, username) => {

  const mailOptions = {
    from: "kayskidadenusi@gmail.com",
    to: to,
    subject: "Login Alert",
    text: `Dear ${username},

            We wanted to let you know that your account was accessed successfully.

            Date & Time: ${new Date().toUTCString()},
            If this was you, no further action is needed. If you didn’t log in, please secure your account 
            immediately by changing your password.

            For assistance, contact us at tvc@gmail.com.

            Stay safe,
            TVC admin,
            TVC`,
      }

  transporter.sendMail(mailOptions, (error, info) => {
    if(error){
      return console.log(error);
    }
    console.log(`Email sent: ${info.response}`);
  })
}


mongoose.connect(uri)
.then(() => {
    console.log("MongoDb database connected");
})
.catch((error) => {
    console.log(`MongoDb connection error: ${error}`);
})

const mySchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { 
        type: String, 
        required: true, 
        unique: true, 
        match: /.+\@.+\..+/ // Simple email validation
    },
    picture: { type: String, required: false },
    password: { type: String, required: true }
});

const MyModel = mongoose.model("tvc_database", mySchema);

app.use(
  session({
    secret: process.env.MY_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
      maxAge: 1000 * 3600,
    }
  }))

app.use(passport.initialize());
app.use(passport.session());

app.get("/",  async (req, res) => {
  let error;
  if(!req.user){
    error = ""
  }
  else{
    error = req.user.error;
  }
    res.render("index.ejs", {error: error});
});

app.get("/register", (req, res) => {
  res.render("register.ejs");
  sendWelcomeEmail(req.user.email, req.user.username);
});

app.get("/dashboard", async (req, res) => {
  if(req.isAuthenticated()){
    if(req.user.error){
      res.redirect("/");
    }
    else{
      res.render("dashboard.ejs", {
        user: req.user.username, 
        picture: req.user.picture,
      });
    // const response = await fetch('https://api.ipify.org?format=json');
    // const response = await fetch('https://ipinfo.io/json');
    // const data = await response.json();
    // const ipAddress = data.ip;
    // const result = await fetch(`http://ip-api.com/json/${ipAddress}`);
    // const location = await result.json();

      sendLoginAlert(req.user.email, req.user.username);
    }
  }
  else{
    res.redirect("/");
  }
  });

app.get(
  "/auth/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);

app.get(
  "/auth/google/dashboard",
  passport.authenticate("google", {
    successRedirect: "/dashboard",
    failureRedirect: "/",
  })
);

app.get("/bible", (req, res) => {
  if(req.isAuthenticated()){
    res.render("bible.ejs");
  }
  else{
    res.redirect("/");
  }
  });

app.get("/plans", (req, res) => {
  if(req.isAuthenticated()){
    res.render("plans.ejs");
  }
  else{
    res.redirect("/");
  }
  });

app.get("/account", (req, res) => {
  if(req.isAuthenticated()){
    res.render("account.ejs", {user: req.user.username});
  }
  else{
    res.redirect("/");
  }
  });

app.get("/records", (req, res) => {
  if(req.isAuthenticated()){
    res.render("records.ejs", {user: req.user.username});
  }
  else{
    res.redirect("/");
  }
  });

app.post("/bible", async (req, res) => {
  try{
    const {
      book: book,
      chapter: chapter,
      verse: verse,
    } = req.body;
  
    console.log(book);
    if(verse){
      const response = await axios.get(`${BIBLE_URL}/${book} ${chapter}:${verse}`)
      console.log(response.data.verses);
      const bookResult = response.data.verses;
      res.render("bible.ejs", { result: bookResult});
    }
    else{
      const response = await axios.get(`${BIBLE_URL}/${book} ${chapter}`)
      console.log(response.data);
      const reference = response.data.reference;
      const bookResult = response.data.verses;
      res.render("bible.ejs", { 
        result: bookResult,
        reference: reference,
      });
    }
  }
  catch(error){
    res.render("bible.ejs", { error: "Please check the Book name and make sure it's correct."});
  }
  

})

app.post("/member", (req, res) => {
  try{
    let {name} = req.body;
    name = name.charAt(0).toUpperCase() + name.slice(1);

    const members = [
      { name: "John", email: "john@example.com", phone: "123-456-7890", years: 5, position: "Deacon" },
      { name: "Jane", email: "jane@example.com", phone: "987-654-3210", years: 3, position: "Usher" },
      { name: {
        firstname: "Joseph",
        lastname: "Adenusi",
        middlename: "Ayomikun",
      },
      email: "adenusijoseph0@gmail.com", phone: "+2347067459068", years: 23, position: "Chorister" },
      { name: {
        firstname: "Kayode",
        lastname: "Adenusi",
        middlename: "David",
      },
      email: "kayskidadenusi@gmail.com", phone: "+2349058949877", years: 26, position: "Chorister" },
    ]; 

    const member = members.find(member => member.name.firstname == name);
    console.log(member)

      if(member){
        res.render("records.ejs", {member});
      }
      else if(!member){
        res.render("records.ejs", {error: "Member not found"});
      }
  }
  catch(error){
    res.send(error);
    console.log(error);
  }
})

  
app.post("/register", async (req, res) => {
  try{
    const response = await axios.post(`${API_URL}/register`, req.body);
    const {
      error: error,
      email: email,
    } = response.data;
    console.log(response);
    const errorMessage = `${error}:  "${email}"`;
    if(error && email){
      res.render("register.ejs", {error: errorMessage});
    }
    else if(error){
      res.render("register.ejs", {error});
    }
    else{
      res.redirect("/");
    }
  }
  catch(error){
    console.error(error.message);
  }

  });


app.post("/login", passport.authenticate("local", {
  successRedirect: "/dashboard",
  failureRedirect: "/",
})
)

passport.use("local", 
  new Strategy(
    async function verify(username, password, cb){
    try{
      const response = await axios.post(`${API_URL}/login`, {username, password});
      const user = response.data;
      console.log(response.data)
      const error = response.data.error
      if(error){
         return cb(null, {error: error,});
      }
      else{
        return cb(null, user)
      }
      
    } 
    catch(error){
      return cb(new Error(error || 'An error occurred during authentication'), false);
    }
  } )
)

passport.use("google",
  new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "https://tvc.onrender.com/auth/google/dashboard",
    userProfileURL: process.env.USERPROFILEURL,
  }, async (accessToken, refreshToken, profile, cb) => {
    try{
      const email = profile.email;
      // const response = await db.query("SELECT * FROM tvc_database WHERE email = $1",
      //   [email],
      // )
      const response = await MyModel.findOne({ email: email });
      if(!response){
        // const newUser = await db.query("INSERT INTO tvc_database (username, email, password) VALUES ($1, $2, $3)",
        //   [profile.given_name, email, "Google"],
        // );

        const newUser = await MyModel.create({ 
          username: profile.given_name,
          email: email,
          picture: profile.picture,
          password: "Google",
         });
       return cb(null, newUser);
        } 
       else if(response){
        return cb(null, response); 
       }
    }
    catch(error){
      return cb(error, true);
    }
  })
)

passport.serializeUser((user, cb) => {
  cb(null, user);
}
)

passport.deserializeUser((user, cb) => {
  cb(null, user);
})

app.listen(port, "0.0.0.0", () => {
  console.log(`Server started running on port ${port}`);
})
// 102.89.46.128