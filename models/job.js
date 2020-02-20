const db = require("../db");
const ExpressError = require("../helpers/expressError");
const sqlForPartialUpdate = require("../helpers/partialUpdate");

class Job {

  static async all(query) {
    let queryString = `SELECT company_handle, title FROM jobs`;
    let whereTerms = [];
    let values = [];

    if (query.search) {
      values.push(`%${query.search}`);
      whereTerms.push(`title ILIKE $${values.length}`);
    }

    if (query.min_salary) {
      if (isNaN(query.min_salary)) {
        throw new ExpressError("parameter needs to be a number", 400);
      }
      values.push(Number(query.min_salary));
      whereTerms.push(`salary > $${values.length}`);
    }

    if (query.min_equity) {
      if (isNaN(query.min_equity)) {
        throw new ExpressError("parameter needs to be a number", 400);
      }
      values.push(Number(query.min_equity));
      whereTerms.push(`equity > $${values.length}`);
    }

    if (whereTerms.length > 0) {
      queryString += " WHERE ";
    }
    const finalQuery = queryString + whereTerms.join(" AND ");
    const result = await db.query(finalQuery, values);
    return result.rows;
  }


  static async create({
    title,
    salary,
    equity,
    company_handle
  }) {
    const result = await db.query(
      `INSERT INTO jobs (
          title,
          salary,
          equity,
          company_handle)
        VALUES ($1, $2, $3, $4)
        RETURNING title, company_handle`,
      [title,
       salary,
       equity,
       company_handle
      ]);

    return result.rows[0];
  }

  static async getId(id) {
    const result = await db.query(
      `SELECT
        j.id,
        j.title,
        j.salary,
        j.equity,
        j.company_handle,
        c.name,
        c.num_employees,
        c.description,
        c.logo_url
        FROM jobs AS j
        JOIN companies AS c ON j.company_handle = c.handle
        WHERE id=$1`,
      [id]
    );
    if (!result.rows[0]) {
      throw new ExpressError(`No such job: ${id}`, 404);
    }
    let row = result.rows[0];

    return {id: row.id,
            title: row.title,
            salary: row.salary,
            equity: row.equity,
            company: {
              handle: row.company_handle,
              name: row.name,
              num_employees: row.num_employees,
              description: row.description,
              logo_url: row.logo_url
            }
          }

  }

  static async update(id, items) {
    let {query,values} = sqlForPartialUpdate("jobs",items,"id",id);
    const result = await db.query(query, values);

    if (!result.rows[0]) {
      throw new ExpressError(`No such job: ${id}`, 404);
    }
    return result.rows[0];
  }

  static async delete(id) {
    let result = await db.query(
      `DELETE FROM jobs
        WHERE id=$1
        RETURNING id`,
      [id]
    );
    if (result.rows.length === 0) {
      throw new ExpressError(`This is no company with handle: ${id}`, 404);
    }
  }

}

module.exports = Job;