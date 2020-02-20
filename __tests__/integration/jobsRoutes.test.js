process.env.NODE_ENV = "test";

const request = require("supertest")

const app = require("../../app");

const db = require("../../db");

let company1= {
  handle: 'amzn',
  name: 'amazon',
  num_employees: 200000,
  description: "e-commerce",
  logo_url: "fake url"
};

let job1= {
  title: 'test_title',
  salary: 100,
  equity: 0.01,
  company_handle: "amzn",
};
let id;
describe("Test Jobs Routes", () => {
  
  beforeEach(async () => {
    await db.query('DELETE FROM companies');
    await db.query('DELETE FROM jobs');
    await db.query(`INSERT INTO companies
                    VALUES ($1, $2, $3, $4, $5)`,
                    [company1.handle, company1.name, company1.num_employees,
                    company1.description, company1.logo_url]);
    let results = await db.query(`INSERT INTO jobs (title, salary, equity, company_handle)
                    VALUES ($1, $2, $3, $4)
                    RETURNING id`,
                    [job1.title, job1.salary, job1.equity,
                     job1.company_handle]);
    id = results.rows[0].id;
  });

  describe("GET /jobs - Gets all jobs", () => {
    test("GET /jobs", async () => {
      let resp = await request(app)
          .get("/jobs");
      expect(resp.status).toBe(200);
      expect(resp.body).toEqual({ 
        jobs: [{
                "company_handle": "amzn",
                "title": "test_title"
        }]});
    });

    test("GET /jobs query search", async () => {
      let resp = await request(app)
          .get("/jobs?search=test_title");
      expect(resp.status).toBe(200);
      expect(resp.body).toEqual({ 
        jobs: [{
                "company_handle": "amzn",
                "title": "test_title"
        }]});
    });

    test("throw an error from GET/jobs min_salary", async () => {
      let resp = await request(app)
        .get("/jobs?min_salary=word");
        expect(resp.status).toBe(400);
    });

    test("should GET/jobs with min_salary passed", async () => {
      let resp = await request(app)
        .get("/jobs?min_salary=150");
        expect(resp.status).toBe(200);
    });

    test("should GET/jobs with min_equity passed", async () => {
      let resp = await request(app)
        .get("/jobs?min_equity=0.001");
        expect(resp.status).toBe(200);
    });
  });

  describe("POST /jobs. Test POST route", () => {
    test("POST /jobs. Can create new job", async () => {
      let resp = await request(app)
        .post("/jobs")
        .send({
          title: 'test_title_2',
          salary: 500,
          equity: 0.50,
          company_handle: "amzn"
        });
        expect(resp.status).toBe(200);
        expect(Object.keys(resp.body)).toHaveLength(1);
       let getResp = await request(app)
          .get("/jobs");
    
          expect(Object.keys(getResp.body.jobs)).toHaveLength(2);

          
    });



    test("POST /jobs. Throws error with missing company_handle data", async () => {
      let resp = await request(app)
        .post("/jobs")
        .send({
          title: 'test_title_2',
          salary: 500,
          equity: 0.50,
        });
        expect(resp.status).toBe(400);
    });
  });

  describe("PATCH /jobs. Test PATCH route", () => {
    test("Patch /jobs/:id. Can update a job", async () => {
      let resp = await request(app)
        .patch(`/jobs/${id}`)
        .send({
          title: 'updated_title',
          salary: 500,
          equity: 0.50,
          company_handle: "amzn"
        });
        expect(resp.status).toBe(200);
        expect(resp.body.job.title).toEqual("updated_title");
    });

    test("PATCH /jobs. Throws error with wrong data type (string for salary_", async () => {
      let resp = await request(app)
        .patch("/jobs")
        .send({
          title: 'test_title_2',
          salary: "500",
          equity: 0.50,
        });
        expect(resp.status).toBe(404);
    });
  });

  describe("DELETE /jobs/id. Test PATCH route", () => {
    test("DELETE /jobs. Can Delete a job by id", async () => {
      let resp = await request(app)
        .delete(`/jobs/${id}`)
      expect(resp.status).toBe(200);
      expect(Object.keys(resp.body)).toHaveLength(1);

      let resp2 = await request(app)
        .get("/jobs");
        expect(Object.keys(resp2.body.jobs)).toHaveLength(0);
    });
  });
});

afterAll(async function () {
  await db.end();
});