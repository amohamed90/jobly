const express = require("express");
const ExpressError = require("../helpers/expressError");
const User = require("../models/user");
const router = express.Router();
const jsonschema = require("jsonschema");
const userSchema = require("../schemas/userSchema");
const updateUserSchema = require("../schemas/updateUserSchema");

const { authenticate, ensureLoggedIn, ensureCorrectUser } = require("../middleware/auth");

const { SECRET_KEY } = require("../config");
const jwt = require("jsonwebtoken");

const middleware = require("../middleware/auth")

router.get("/", async function (req, res, next) {
  try {
    let users = await User.all();
    return res.json({ users });
  } catch (err) {
    return next(err);
  }
});

router.post("/", async function (req, res, next) {
  try {
    const result = jsonschema.validate(req.body, userSchema);

    if (!result.valid) {
      let listOfErrors = result.errors.map(error => error.stack);
      let error = new ExpressError(listOfErrors, 400);
      return next(error);
    }
    let user = await User.create(req.body);
    
    let payload = {username: user.username,
                   is_admin: user.is_admin};
    let token = jwt.sign( payload, SECRET_KEY);
    

    return res.status(201).json({ token });
  } catch (err) {
    return next(err);
  }
});

router.get("/:username", authenticate, async function (req, res, next) {
  try {
    let user = await User.getUserByUsername(req.params.username);

    return res.json({ user });
  } catch (err) {
    return next(err);
  }
});

router.patch("/:username", ensureCorrectUser, async function(req, res, next) {
  try {

    const result = jsonschema.validate(req.body, updateUserSchema);

    if (!result.valid) {
      let listOfErrors = result.errors.map(error => error.stack);
      let error = new ExpressError(listOfErrors, 400);
      return next(error);
    }

    let username = req.params.username;
    let items = req.body;

    let user = await User.update(username, items);

    return res.json({ user });

  } catch (err) {
    return next(err);
  }
});

router.delete("/:username", ensureCorrectUser, async function(req, res, next) {
  try {
    let result = await User.delete(req.params.username);
    return res.json(result);
  } catch(err) {
    return next(err);
  }
});












module.exports = router