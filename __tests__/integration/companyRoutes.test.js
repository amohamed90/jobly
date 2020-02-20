process.env.NODE_ENV = "test";

const request = require("supertest")

const app = require("../../app");

const db = require("../../db");

let company1= {
  "handle": 'amzn',
  "name": 'amazon',
  "num_employees": 200000,
  "description": "e-commerce",
  "logo_url": "fake url"
};

describe("Test Company Routes", () => {
  beforeEach(async () => {
    await db.query('DELETE FROM companies');
    await db.query(`INSERT INTO companies
                    VALUES ($1, $2, $3, $4, $5)`,
                    [company1.handle, company1.name, company1.num_employees,
                    company1.description, company1.logo_url]);
  });

  test("GET /companies", async () => {
    let resp = await request(app)
        .get("/companies");
    expect(resp.status).toBe(200);
    expect(resp.body).toEqual({ companies: expect.any(Array)});
  });

  test("GET /companies query search", async () => {
    let resp = await request(app)
        .get("/companies?search=company");
    expect(resp.status).toBe(200);
    expect(resp.body).toEqual({ companies: expect.any(Array)});
  });

  test("throw an error from GET/companies min_employees", async () => {
    let resp = await request(app)
      .get("/companies?min_employees=word");
      expect(resp.status).toBe(400);
  });

  test("throw an error from GET/companies min_employees > max_employees", async () => {
    let resp = await request(app)
      .get("/companies?min_employees=10&max_employees=5");
      expect(resp.status).toBe(400);
  })

  test("POST /companies. Can create new company", async () => {
    let resp = await request(app)
      .post("/companies")
      .send({
        "handle": "aapl",
        "name": "Apple",
        "num_employees": 100000,
        "description": "Big tech company",
        "logo_url": "logo url"
      });
      expect(resp.status).toBe(200);
      expect(Object.keys(resp.body)).toHaveLength(1);
  })

  test('GET /companies/:handle. Can get a specific company by handle', async () => {
    let resp = await request(app)
    .get("/companies/amzn");

    expect(resp.status).toBe(200);
    expect(Object.keys(resp.body)).toHaveLength(1);
  });

  test('GET /companies/:handle. Should throw an error for non-existing company', async () => {
    let resp = await request(app)
    .get("/companies/google");

    expect(resp.status).toBe(404);
  });

  test("PUT /companies. Can update company", async () => {
    let resp = await request(app)
      .patch("/companies/amzn")
      .send({
        "handle": 'amzn',
        "name": 'amazon',
        "num_employees": 400000,
        "description": "testing",
        "logo_url": "fake url"
      });
    expect(resp.status).toBe(200);
  });

  test("DELETE /companies. Can Delete a company", async () => {
    let resp = await request(app)
      .delete("/companies/amzn")
    expect(resp.status).toBe(200);
    expect(Object.keys(resp.body)).toHaveLength(1);
  });
});

afterAll(async function () {
  await db.end();
})