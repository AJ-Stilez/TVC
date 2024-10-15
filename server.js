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

//Please work;

env.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = process.env.PORT || 5353;
const uri = process.env.URI;
const API_URL = process.env.TVC_DATABASE;
const BIBLE_URL = process.env.BIBLE_API;

app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(express.json());


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

app.get("/",  (req, res) => {
    res.render("index.ejs");
  });

app.get("/register", (req, res) => {
  res.render("register.ejs");
})

// app.get("/login", (req, res) => {
//   res.render("index.ejs", {error: "Incorrect Username or Password"});
// })

app.get("/dashboard", (req, res) => {

  if(req.isAuthenticated()){
    res.render("dashboard.ejs", {
      user: req.user.username, 
      picture: req.user.picture,
    }); 
    console.log(req.user.picture);
    console.log(req.user);
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
       return cb(error);
      }
      else{
        return cb(null, user)
      }
      
    } 
    catch(error){
      return cb(error.messsage, true);
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
      // console.log(profile.picture);
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

app.listen(port, () => {
  console.log(`Server started running on port ${port}`);
})