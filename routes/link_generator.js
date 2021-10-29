const express = require("express");
const router = express.Router();
const User = require("../models/user")
const UserResource = require("../models/userResource")
const path = require("path");
const fs = require("fs");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const link_limit = 5;
const jwt = require("jsonwebtoken")
const dotenv = require("dotenv")

dotenv.config()


function is_authenticated(req, res, next){
    // if authenticated -> dashboard view else -> redirect to login
    let id = req.session.userId
    User.findOne({ _id : id}, (err, user) =>{
        if (user){
            console.log("logged in");
            req.session.user = user
            next()
        } else{
            res.redirect("/login")   
        }
    })
}

router.use(is_authenticated);

router.get("/dashboard", (req, res) => {
    UserResource.find({user: req.session.user._id}, (err, data) =>{
        if (data){
            res.render("dashboard", {name: req.session.user.name, generated_links: data})
        } else{
            res.status(500).send(err);
        }
    })
})

function generateToken(payload){
    return jwt.sign(payload, process.env.TOKEN_SECRET, { expiresIn: '300s' })
}

router.post("/generate_link", (req, res) => {
    let resource_file = req.files.resource;
    let file_path = path.resolve("./public/")
    let error_check = false
    fs.access( path.join( file_path +"/"+ req.session.user._id +"/"), (err) => {
        if (err){
            fs.mkdir(file_path +"/" + req.session.user._id +"/", (err) => {
                if (err){
                    error_check = true;
                    return res.status(500).send(err);
                }
            })
        }  
        if (error_check == false){
            resource_file.mv(file_path +"/"+ req.session.user._id + "/" + resource_file.name, (err) => {
                if (err){
                    return res.status(500).send(err);
                } else{
                    let token = generateToken({user_id : req.session.user._id, resource: resource_file.name})
                    newUserResource = new UserResource({
                        user: req.session.user._id,
                        resource: resource_file.name,
                        link: token
                    })
                    newUserResource.save((err, userResource) => {
                        if (err){
                            res.send(err);
                        } else{
                            res.redirect("/dashboard")
                        }
                    })
                }
            })
        }
    })
})  
  
// link param -> verify_token -> if valid, check req.session.userId & payload user_id -> find userResource

router.get("/:link", (req, res) => {
    let link = req.params.link;
    jwt.verify(link, process.env.TOKEN_SECRET, (err, payload) => {
        if (err){
            res.status(500).send(err);
        } else{
            if (req.session.userId == payload.user_id){
                UserResource.findOne({link: link }, async (err, data) => {
                    if (data){
                        if(data.count < link_limit){
                            res.sendFile(path.resolve("./public/")+"/"+ data.user.toString() +"/"+data.resource );
                            data.count += 1;
                            await data.save();
                        } else{
                            res.send(500).send(`Limit reached, You have accessed the link ${link_limit} times`);
                        }
                    } else{
                        res.status(500).send(err)
                    }
                })
            } else{
                res.status(500).send("Invalid Token")
            }
        }
    })
    
})

module.exports = router