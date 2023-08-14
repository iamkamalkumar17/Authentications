//jshint esversion:6
require('dotenv').config();
const express = require("express");
const ejs = require("ejs");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const md5 = require("md5")

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
    const newUser = new User({
        email: req.body.username,
        password: md5(req.body.password)
    });
    newUser.save().catch((err) => {console.log(err)}).then(res.render("secrets"));
});
app.post("/login", (req,res)=>{
    const username = req.body.username;
    const password = md5(req.body.password);

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