//jshint esversion:6
require('dotenv').config();
const express = require("express");
const ejs = require("ejs");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const session = require('express-session');
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const findOrCreate = require("mongoose-findorcreate");
//passport-local-mongoose automatically salt and hash our password for us

//npm i passport passport-local passport-local-mongoose express-session
//this saves our session in cookies, and we don't get logged out until we don;t logout

//third party OAuth- open authentication
//npm install passport-google-oauth20
//create an application on google developres console


const app = express();
const port = 3000;



app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));

app.use(session({
    secret: "our little secret",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://127.0.0.1:27017/userDB").then(console.log("mongodb connected at 27017"));
//we need proper schema for these methods
const userSchema =new mongoose.Schema({
    email: String,
    password: String,
    googleId: String
});

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);


const User = new mongoose.model("User", userSchema);

passport.use(User.createStrategy());

// use static serialize and deserialize of model for passport session support
passport.serializeUser(function(user, cb) {
    process.nextTick(function() {
      return cb(null, user.id);
    });
  });
  
  passport.deserializeUser(function(id, cb) {
    db.get('SELECT * FROM users WHERE id = ?', [ id ], function(err, user) {
      if (err) { return cb(err); }
      return cb(null, user);
    });
  });

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/",
    userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo"
  },
  function(accessToken, refreshToken, profile, cb) {
    User.findOrCreate({ googleId: profile.id }, function (err, user) {
      return cb(err, user);
    });
  }
));

app.get("/register", (req, res)=> {
    res.render("register")
});
app.get("/secrets", function(req, res){
    if(req.isAuthenticated()) {
        res.render("secrets");
    } else {
        res.redirect("/login");
    }
})

app.post("/register", (req, res) => {
    User.register({username: req.body.username}, req.body.password, function(err, user) {
        if(err) {
            console.log(err);
            res.redirect("/register");
        } else {
            passport.authenticate("local")(req, res, function(){
                res.redirect("/secrets");
            })
        }
    })
    
});
app.post("/login", (req,res)=>{
    const user = new User({
        username: req.body.username,
        password: req.body.password
    });
    req.login(user, function(err){
        if(err) {
            console.log(err);
        } else {
            passport.authenticate("local")(req, res, function(){
                res.redirect("/secrets");
            })
        }
    })
})
app.get("/login", (req, res) => {
    res.render("login");
})
app.get("/logout", (req, res)=> { 
    req.logout((err)=>{console.log(err)});
    res.redirect("/")
});

app.get("/", (req, res) => {
    res.render("home.ejs");
})


app.get("/auth/google", function(req, res){
    passport.authenticate("google", {scope: ['profile']});
})

app.get('/auth/google/secrets', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect secrets.
    res.redirect('/secrets');
  });
app.listen(port, ()=>{
    console.log("app runs at 3000");
})