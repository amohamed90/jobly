/** Middleware for handling req authorization for routes. */

const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");
const ExpressError = require("../helpers/expressError");
/** Middleware: Authenticate user. */

function authenticate(req, res, next) {
  try {
    const tokenFromBody = req.body._token;

    const payload = jwt.verify(tokenFromBody, SECRET_KEY);
    res.locals.username = payload.username; // create a current user
    console.log("PAYLOAD *******************", payload);
    if(payload) {
      return next()
    }
    // throw new ExpressError(`Invalid token`, 404);
  } catch (err) {
    return next(err);
  }
}


// /** Middleware: Requires correct username. */

function ensureCorrectUser(req, res, next) {
  try {
    const tokenStr = req.body._token;
    let token = jwt.verify(tokenStr, SECRET_KEY);
    res.locals.username = token.username;

    if(token.username === req.params.username) {
      return next();
    }
    throw new Error()
  } catch (err) {
    // errors would happen here if we made a request and req.user is undefined
    return next(new ExpressError("Unauthorized", 401));
  }
}
// end

module.exports = {
  authenticate,
  ensureCorrectUser
};
