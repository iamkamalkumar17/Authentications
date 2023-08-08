//jshint esversion:6
require('dotenv').config();
const express = require("express");
const ejs = require("ejs");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
//we use mongoose-encryption to encrypt our password
const encrypt = require("mongoose-encryption");

const app = express();
const port = 3000;

mongoose.connect("mongodb://127.0.0.1:27017/userDB").then(console.log("mongodb connected at 27017"));

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));

//we need proper schema for these methods
const userSchema =new mongoose.Schema({
    email: String,
    password: String
});

//our key
// const secret = "Thisisourlittlesecret.";
//the secret went in .env, if we are not using .env, we need to put our key here
//we use our encrypt in our userSchema with our key
//we are only encrypting password field
userSchema.plugin(encrypt, {secret: process.env.SECRET, encryptedFields: ["password"]});
//we are getting our key from .env file

const User = new mongoose.model("User", userSchema);

app.get("/register", (req, res)=> {
    res.render("register");
});

app.post("/register", (req, res) => {
    const newUser = new User({
        email: req.body.username,
        password: req.body.password
    });
    newUser.save().catch((err) => {console.log(err)}).then(res.render("secrets"));
});
app.post("/login", (req,res)=>{
    const username = req.body.username;
    const password = req.body.password;

    User.findOne({email: username}).then((foundUser) => {
        if(foundUser.password === password) {
            res.render("secrets");
        } else {
            res.render("login");
        }
    }).catch((err) => {console.log(err)});
})
app.get("/login", (req, res) => {
    res.render("login");
})
app.get("/logout", (req, res)=> { res.redirect("/")});

app.get("/", (req, res) => {
    res.render("home.ejs");
})

app.listen(port, ()=>{
    console.log("app runs at 3000");
})