const express = require("express");
const ExpressError = require("../helpers/expressError");
const Job = require("../models/job");
const router = express.Router();
const jsonschema = require("jsonschema");
const jobSchema = require("../schemas/jobSchema");
const updateJobSchema = require("../schemas/updateJobSchema");

router.get("/", async function (req, res, next) {
  try {
    let results = await Job.all(req.query);
    return res.json({
      "jobs": results
    });
  } catch (err) {
    return next(err);
  }
});

router.post("/", async function (req, res, next) {
  try {
    const result = jsonschema.validate(req.body, jobSchema);

    if (!result.valid) {
      let listOfErrors = result.errors.map(error => error.stack);
      let error = new ExpressError(listOfErrors, 400);
      return next(error);
    }
    let job = await Job.create(req.body);

    return res.json({
      job
    });
  } catch (err) {
    return next(err)
  }
});

router.get("/:id", async function (req, res, next) {
  try {
    id = req.params.id
    let job = await Job.getId(id);

    return res.json({
      job
    });
  } catch (err) {
    return next(err)
  }
});

router.patch("/:id", async function (req, res, next) {
  try {
    const result = jsonschema.validate(req.body, updateJobSchema);

    if (!result.valid) {
      let listOfErrors = result.errors.map(error => error.stack);
      let error = new ExpressError(listOfErrors, 400);
      return next(error);
    }
    let handle = req.params.id; // this will be `key` in helper function
    let items = req.body;

    let job = await Job.update(handle, items);

    return res.json({
      job
    });
  } catch (err) {
    return next(err);
  }
});

router.delete("/:id", async function (req, res, next) {
  try {
    await Job.delete(req.params.id);
    return res.json({
      message: "Job deleted"
    });
  } catch (err) {
    return next(err);
  }
})


module.exports = router