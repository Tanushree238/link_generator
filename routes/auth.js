const express = require('express');
const router = express.Router();
const User = require('../models/user');
const bcrypt = require('bcrypt');
const saltRounds = 10;

router.get(['/', '/register'], (req, res) => {
    if (req.session.userId){
        res.redirect("/dashboard");
    }
    res.render('home')
})

// Data Formats not validated - Regex , validation module
// Email is not unique

router.post(['/', '/register'], (req, res) => {
    let data = req.body;
    if (data.email && data.name && data.password){
        if (data.password == data.confirm_password){
            bcrypt.hash(data.password, saltRounds, (err, encrypted_password) => {
                let newUser = new User({
                    email: data.email,
                    name: data.name,
                    password: encrypted_password
                })
                newUser.save((err, user) => {
                    if (err){
                        console.log(err);
                    } else {
                        console.log("Success");
                        // Opt - 1 -> Login & redirect to dashboard 
                        // Opt - 2 -> redirect to login
                        req.session.userId = user._id.toString()
                        res.redirect("\dashboard")
                    }
                });
            });
        }
    } else{
        res.sendStatus(500);
    }
})

router.get("/login", (req, res) => {
    if (req.session.userId){
        res.redirect("/dashboard");
    }
    res.render("login")
})

router.post("/login", (req, res) =>{
    let data = req.body;
    if (data.email && data.password){
        User.findOne({ email: data.email}, (err, user) => {
            if (user){
                bcrypt.compare(data.password, user.password, (err, result) => {
                    if (result == true){
                        req.session.userId = user._id.toString()
                        // res.send({"Success": "Login successful!"})
                        res.redirect("\dashboard")
                    } else{
                        res.send({"Error": "Incorrect Password"})
                    }
                })
            } else{
                res.send({"Error": "Incorrect email"});
            }
        })
    } else {
        res.sendStatus(500)
    }
})

router.get("/logout", (req, res) => {
    // session destory redirect to login
    if (req.session){
        req.session.destroy((err) => {
            if (err){
                res.send({"Error": err})
            } else{
                res.redirect("/login")
            }
        })
    }
})


module.exports = router