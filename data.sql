CREATE TABLE companies (
  handle text PRIMARY KEY,
  name text NOT NULL UNIQUE,
  num_employees INTEGER,
  description text,
  logo_url text
);

CREATE TABLE jobs (
  id SERIAL PRIMARY KEY,
  title text NOT NULL,
  salary float NOT NULL,
  equity float NOT NULL CHECK(equity <= 1.0),
  company_handle text NOT NULL REFERENCES companies ON DELETE CASCADE,
  date_posted TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO companies (handle, name, num_employees, description, logo_url)
  VALUES ('amzn', 'amazon', 1000, 'merchandise company', 'none'),
         ('goog', 'google', 2000, 'Big Company', 'none'),
         ('aapl', 'apple', 3000, 'tech company', 'none');


INSERT INTO jobs (title, salary, equity, company_handle)
  VALUES ('developer', 100, 0.5, 'amzn'),
         ('software Engineer', 200, 0.4, 'goog'),
         ('UX Designer', 300, 0.6, 'aapl');