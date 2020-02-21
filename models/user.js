const db = require("../db");
const ExpressError = require("../helpers/expressError");
const sqlForPartialUpdate = require("../helpers/partialUpdate");
const { BCRYPT_WORK_FACTOR } = require("../config");
const bcrypt = require("bcrypt");

class User {

  static async all() {
    let result = await db.query(`SELECT username,
                                        first_name,
                                        last_name,
                                        email FROM
                                        users`);
    return result.rows;
  }

  static async create({ username, password, first_name, last_name, email, photo_url, is_admin}) {
    const hashed_password = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);

    const result = await db.query(`INSERT INTO users
                                    (username,
                                    password,
                                    first_name,
                                    last_name,
                                    email,
                                    photo_url,
                                    is_admin)
                                  VALUES($1, $2, $3, $4, $5, $6, $7)
                                  RETURNING
                                    username,
                                    first_name,
                                    last_name,
                                    email,
                                    photo_url,
                                    is_admin`,
                                    [username,
                                      hashed_password,
                                      first_name,
                                      last_name,
                                      email,
                                      photo_url,
                                      is_admin
                                    ]);
    return result.rows[0];

  }

  static async authenticate(username, password) {
    
    const result = await db.query(
      `SELECT password, username, is_admin
         FROM users
         WHERE username = $1`,
      [username]
    )
    const user = result.rows[0]

    if (user && await bcrypt.compare(password, user.password)) {
      return user;
    };


  }

  static async getUserByUsername(username) {
    const user = await db.query(`SELECT username,
                                    first_name,
                                    last_name,
                                    email,
                                    photo_url,
                                    is_admin FROM users WHERE
                                    username = $1`, [username]);

    let result = user.rows[0];
    if (!result) {
      throw new ExpressError(`No user by ${username}`, 404);
    }

    return result;
  }


  static async update(username, items) {
    if (items['password']) {
      items.password = await bcrypt.hash(items['password'], BCRYPT_WORK_FACTOR);
    }

    let {query, values} = sqlForPartialUpdate("users", items, "username", username);
    const result = await db.query(query, values);

    if (!result.rows[0]) {
      throw new ExpressError(`No such user: ${username}`, 404);
    }

    return result.rows[0];
  }


  static async delete(username) {
    let result = await db.query(
      `DELETE FROM users
        WHERE username = $1 RETURNING username`, [username]
    );

    if (result.rows.length === 0) {
      throw new ExpressError(`There is no user with this username: ${username}`);
    }
    return { message: "User deleted" }
  }
}


module.exports = User;