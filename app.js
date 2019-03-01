//jshint esversion:6
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');
const encrypt = require('mongoose-encryption');

const app = express();

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended: true
}));

mongoose.connect("mongodb://localhost:27017/userDB", {useNewUrlParser: true});

const userSchema = mongoose.Schema({
  email: String,
  password: String
});


userSchema.plugin(encrypt, { secret: process.env.SECRET, encryptedFields: ["password"] });
const User = mongoose.model("User", userSchema);




app.get("/", function(req,res){
  res.render("home");
});

app.route("/register")
.get(function(req,res){
  res.render("register");
})
.post(function(req, res){
  let email = req.body.username;
  let password = req.body.password;

  const user = new User({
    email: email,
    password: password
  });
  user.save(function(err){
    if(!err) {
      res.render("secrets");
    } else {
      console.log("There was an error while saving the new user: " + err);
    }
  });
});

app.route("/login")
.get(function(req,res){
  res.render("login");
})
.post(function(req, res){
  let email = req.body.username;
  let password = req.body.password;

  User.findOne({email: email}, function(err, foundUser){
    if(!err){
      if(foundUser){
        if(foundUser.password === password){
          res.render("secrets");
        } else {
          res.send("Incorrect password! Redirecting back to login.");
        }
      } else {
        res.send("Oops! That user doesn't exist. Try again.");
      }
    } else {
      res.send("Looks like there was an error searching the databse: "+ err);
    }
  })

})



app.listen(3000, function(){
  console.log("Server started on port 3000.");
});
