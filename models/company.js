const db = require("../db");
const ExpressError = require("../helpers/expressError");
const sqlForPartialUpdate = require("../helpers/partialUpdate");

class Company {

  static async all(query) {
    let queryString = `SELECT handle, name FROM companies`;
    let whereTerms = [];
    let values = [];

    if (query.min_employees && query.max_employees) {
      let min = Number(query.min_employees);
      let max = Number(query.max_employees);

      if (min > max) {
        throw new ExpressError("min can't be more than max", 400)
      }
    }
    if(query.search) {
      values.push(`%${query.search}`);
      whereTerms.push(`name ILIKE $${values.length}`);
    }

    if (query.min_employees) {
      if (isNaN(query.min_employees)) {
        throw new ExpressError ("parameter needs to be a number", 400);
      }
      values.push(Number(query.min_employees));
      whereTerms.push(`num_employees <= $${values.length}`);
    }

    if (query.max_employees) {
      if (isNaN(query.min_employees)) {
        throw new ExpressError("parameter needs to be a number", 400);
      }
      values.push(Number(query.max_employees));
      whereTerms.push(`num_employees <= $${values.length}`);
    }

    if (whereTerms.length > 0) {
      queryString += " WHERE ";
    }
    const finalQuery = queryString + whereTerms.join(" AND ");
    const result = await db.query(finalQuery, values);
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
    const company = await db.query(
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
    const jobs = await db.query(
      `SELECT
        id,
        title,
        salary,
        equity
        FROM jobs
        WHERE company_handle=$1`,
        [handle]
    )
    const output = { ...company.rows[0], "jobs": jobs.rows}
    
    if(!output) {
      throw new ExpressError(`No such company: ${handle}`, 404);
    }
    return output;
    }

  static async update(handle, items) {
    let {query, values} = sqlForPartialUpdate("companies",items,"handle",handle);
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