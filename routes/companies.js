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







module.exports = router