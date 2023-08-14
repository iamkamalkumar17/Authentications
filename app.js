//jshint esversion:6
require('dotenv').config();
const express = require("express");
const ejs = require("ejs");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

//
const saltRounds = 10;

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



const User = new mongoose.model("User", userSchema);

app.get("/register", (req, res)=> {
    res.render("register");
});

app.post("/register", (req, res) => {
    bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
        // Store hash in your password DB.
        const newUser = new User({
            email: req.body.username,
            password: hash
        });
        newUser.save().catch((err) => {console.log(err)}).then(res.render("secrets")); 

    });
    
});
app.post("/login", (req,res)=>{
    const username = req.body.username;
    const password = req.body.password

    User.findOne({email: username}).then((foundUser) => {
        bcrypt.compare(req.body.password, foundUser.password, function(err, result) {
            // result == true
            if(result == true) {
                res.render("secrets");
            } else {
                res.render("login");
            }
        })
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