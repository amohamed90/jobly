const db = require("../db");
const ExpressError = require("../helpers/expressError");
const sqlForPartialUpdate = require("../helpers/partialUpdate");

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
    if(isNaN(num)) {
      throw new ExpressError("Please enter a valid number", 400);
    }
    const result = await db.query(`SELECT handle, name FROM companies WHERE num_employees > $1`, [num]);
    return result.rows;
  }

  static async maxEmployees(num) {
    if(isNaN(num)) {
      throw new ExpressError("Please enter a valid number", 400);
    }
    const result = await db.query(`SELECT handle, name FROM companies WHERE num_employees < $1`, [num]);
    return result.rows;
  }

  static async minMaxEmployees(min, max) {
    if(isNaN(num)) {
      throw new ExpressError("Please enter a valid number", 400);
    }
    const result = await db.query(`SELECT handle, name FROM companies WHERE num_employees >= $1 AND num_employees <= $2`, [min, max]);
    return result.rows;
  }

  static async create({ handle, name, num_employees, description, logo_url }) {
    const result = await db.query(
      `INSERT INTO companies (
          handle,
          name,
          num_employees,
          description,
          logo_url)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING handle, name`,
        [handle, name, num_employees, description, logo_url]);

    return result.rows[0];
  }

  static async getHandle(handle) {
    const result = await db.query(
      `SELECT 
        handle,
        name,
        num_employees,
        description,
        logo_url
        FROM companies
        WHERE handle=$1`,
        [handle]
    );
    if(!result.rows[0]) {
      throw new ExpressError(`No such company: ${handle}`, 404);
    }
    return result.rows[0];
  }

  static async update(handle, items) {
    let {query, values} = sqlForPartialUpdate(
      "companies",
      items,
      "handle",
      handle
    );
    const result = await db.query(query, values);
    
    if(!result.rows[0]) {
      throw new ExpressError(`No such company: ${handle}`, 404);
    }
    return result.rows[0];
  }

  static async delete(handle) {
    let result = await db.query( 
      `DELETE FROM companies
        WHERE handle=$1
        RETURNING handle`,
        [handle]
    );
    if(result.rows.length === 0) {
      throw new ExpressError(`This is no company with handle: ${handle}`, 404);
    }
  }
}



module.exports = Company;