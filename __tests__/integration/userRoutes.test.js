process.env.NODE_ENV = "test";

const request = require("supertest")

const app = require("../../app");

const db = require("../../db");

let user = {
  username: 'Boby',
  password: 'password',
  first_name: 'Bob',
  last_name: 'john',
  email: "bob@bob.com",
  photo_url: null,
  is_admin: false
};

describe("Test Users Routes", () => {

  beforeEach(async () => {
    await db.query('DELETE FROM users');
    await db.query(`INSERT INTO users
                    VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [user.username, user.password, user.first_name,
        user.last_name, user.email, user.photo_url,
        user.is_admin]);
  });

  describe("GET/ USERS - get all users", () => {
    test("GET /USERS", async () => {
      let resp = await request(app)
          .get("/users");

      expect(resp.status).toBe(200);
      expect(resp.body).toEqual({
        users: [{
          username: "Boby",
          first_name: "Bob",
          last_name: "john",
          email: "bob@bob.com"
        }]
      });
    });

    test("GET /USERS will throw an error with given inavlid username", async () => {
      let resp = await request(app)
        .get("/users/tete");

      expect(resp.status).toBe(404);
    });

    test("GET /USERS/USERNAME get a single user", async () => {
      let resp = await request(app)
        .get("/users/Boby");

      expect(resp.status).toBe(200);
      expect(resp.body).toEqual({
        user: {
          username: "Boby",
          first_name: "Bob",
          last_name: "john",
          email: "bob@bob.com",
          photo_url: null,
          is_admin: false
        }
      });
    });
  });


  describe("POST /user. Test POST route", () => {
        test("POST /users. Can create new user", async () => {
          let resp = await request(app)
            .post("/users")
            .send({
              username: 'Annabelle',
              password: 'password',
              first_name: 'Anna',
              last_name: 'Dean',
              email: "ana@ana.com",
              is_admin: false
            });
            expect(resp.status).toBe(200);
            expect(Object.keys(resp.body)).toHaveLength(1);
            let getResp = await request(app)
            .get("/users");
          expect(Object.keys(getResp.body.users)).toHaveLength(2);

        });

        test("POST /users. Throws error with missing user data", async () => {
          let resp = await request(app)
            .post("/users")
            .send({
              password: 'password',
              first_name: 'Anna',
              last_name: 'Dean',
              email: "ana@ana.com",
              is_admin: false
            });
          expect(resp.status).toBe(400);
        });
  });


  describe("PATCH /users. Test PATCH route", () => {
    test("Patch /users/:username. Can update a user", async () => {
      let resp = await request(app)
        .patch(`/users/${user.username}`)
        .send({
          username: 'Notboby'
        });
      expect(resp.status).toBe(200);
      expect(resp.body.user.username).toEqual("Notboby");
    });

    test("PATCH /users. Throws error with wrong data type", async () => {
      let resp = await request(app)
        .patch(`/users/${user.username}`)
        .send({
          username: 'Boby',
          password: 'password',
          first_name: 25
        });
      expect(resp.status).toBe(400);
    });
  });

});



afterAll(async function () {
  await db.end();
});
