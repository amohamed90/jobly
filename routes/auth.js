const express = require("express");
const jwt = require("jsonwebtoken");
const ExpressError = require("../helpers/expressError");
const { SECRET_KEY } = require("../config");
const User = require("../models/User");

const router = new express.Router();


router.post('/login', async function(req, res, next){
  try{
    console.log("++++++++++++++++++++++++ GOT TO LOGIN")
    const { username, password } = req.body;

    let user = await User.authenticate(username, password);
    
    if(user){
      let payload = {username: user.username, is_admin: user.is_admin}
      console.log("FROM AUTH payload *******", payload)
      let _token = jwt.sign( payload , SECRET_KEY);
      console.log("FROM AUTH Token *******", _token.username)
      return res.json({ _token })
    }  
    
    throw new ExpressError("Invalid username or password.", 400)
    
  } catch (err){
    return next(err)
  }
})


module.exports = router