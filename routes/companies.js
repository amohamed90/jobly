const express = require("express");
const ExpressError = require("../helpers/expressError");
const Company = require("../models/company");
const router = express.Router();

router.get("/", async function(req, res, next) {
  try {
    let results = await Company.all();

    if (req.query.search) {
     let results = await Company.search(req.query.search);
     return res.json({"companies": results});
    }

    if (req.query.min_employees && !req.query.max_employees) {
      let results = await Company.minEmployees(Number(req.query.min_employees));
      return res.json({"companies": results});
    }

    if (req.query.max_employees && !req.query.min_employees) {
      let results = await Company.maxEmployees(Number(req.query.max_employees));
      return res.json({"companies": results});
    }

    if (req.query.min_employees && req.query.max_employees) {

      let min = Number(req.query.min_employees);
      let max = Number(req.query.max_employees);
      console.log("*********", min, max)
      if (min > max) {
        throw new ExpressError("parameters are incorrect", 400);
      }

      let results = await Company.minMaxEmployees(min, max);
      return res.json({"companies": results});
    }

    return res.json({"companies": results});
  } catch (err) {
    return next(err);
  }
});

router.post("/", async function(req, res, next) {
  try {
    let { handle, name, num_employees, description, logo_url }  = req.body; 
    let company = await Company.create({ handle, name, num_employees, description, logo_url});

    return res.json({company});

  }
  catch (err) {
    return next(err)
  }
});

router.get("/:handle", async function(req, res, next) {
  try {
    handle = req.params.handle
    let company = await Company.getHandle(handle);
    
    return res.json({ company });
  }
  catch (err) {
    return next(err)
  }
});

router.patch("/:handle", async function(req, res, next) {
  try {
    let handle =req.params.handle; // this will be `key` in helper function
    let items = req.body;

    let company = await Company.update(handle, items);

    return res.json({ company });
  } 
  catch (err) {
    return next(err);
  }
});

router.delete("/:handle", async function(req, res, next) {
  try {
    await Company.delete(req.params.handle);
    return res.json({ message: "company deleted" });
  }
  catch (err) {
    return next(err);
  }
})






module.exports = router