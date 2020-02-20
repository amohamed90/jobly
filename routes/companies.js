const express = require("express");
const ExpressError = require("../helpers/expressError");
const Company = require("../models/company");
const router = express.Router();
const jsonschema = require("jsonschema");
const companySchema = require("../schemas/companySchema");
const updateCompanySchema = require("../schemas/updateCompanySchema");

router.get("/", async function(req, res, next) {
  try {
    let results = await Company.all(req.query);
    return res.json({"companies": results});
  } catch (err) {
    return next(err);
  }
});

router.post("/", async function(req, res, next) {
  try {
    const result = jsonschema.validate(req.body, companySchema);

    if (!result.valid) {
      let listOfErrors = result.errors.map(error => error.stack);
      let error = new ExpressError(listOfErrors, 400);
      return next(error);
    }
    let company = await Company.create(req.body);

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
     const result = jsonschema.validate(req.body, updateCompanySchema);

     if (!result.valid) {
       let listOfErrors = result.errors.map(error => error.stack);
       let error = new ExpressError(listOfErrors, 400);
       return next(error);
     }
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