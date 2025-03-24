const express = require("express");
let router = express.Router();

const User = require("../model/user")


router.get('/welcome', async (req,res) => {

    const users =  await User.find({});

    return   res.send({
        users : users,
        message: "Welcome to KOSMO"
    })

});




exports.router = router;


