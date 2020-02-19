const db = require("../db");
const ExpressError = require("../helpers/expressError");

class Company {

  static async all() {
    const result = await db.query(`SELECT handle, name FROM companies`);
    return result.rows;
  }

  static async search(string) {
    const result = await db.query(`SELECT handle, name FROM companies WHERE name=$1`, [string])
    return result.rows;
  }

  static async minEmployees(num) {
    const result = await db.query(`SELECT handle, name FROM companies WHERE num_employees > $1`, [num]);
    return result.rows;
  }

  static async maxEmployees(num) {
    const result = await db.query(`SELECT handle, name FROM companies WHERE num_employees < $1`, [num]);
    return result.rows;
  }

  static async minMaxEmployees(min, max) {
    const result = await db.query(`SELECT handle, name FROM companies WHERE num_employees >= $1 AND num_employees <= $2`, [min, max]);
    return result.rows;
  }

}



module.exports = Company;