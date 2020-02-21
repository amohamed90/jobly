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

CREATE TABLE users (
  username text PRIMARY KEY,
  password text NOT NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text NOT NULL UNIQUE,
  photo_url text,
  is_admin BOOLEAN NOT NULL DEFAULT FALSE
);

INSERT INTO companies (handle, name, num_employees, description, logo_url)
  VALUES ('amzn', 'amazon', 1000, 'merchandise company', 'none'),
         ('goog', 'google', 2000, 'Big Company', 'none'),
         ('aapl', 'apple', 3000, 'tech company', 'none');


INSERT INTO jobs (title, salary, equity, company_handle)
  VALUES ('developer', 100, 0.5, 'amzn'),
         ('software Engineer', 200, 0.4, 'goog'),
         ('UX Designer', 300, 0.6, 'aapl');

INSERT INTO users (username, password, first_name, last_name, email, photo_url, is_admin)
  VALUES ('testing1', 'password', 'test1first', 'test1first', 'test1@test.com', NULL, FALSE),
         ('testing2', 'password', 'test2first', 'test2first', 'test2@test.com', NULL, FALSE),
         ('testing3', 'password', 'test3first', 'test3first', 'test3@test.com', NULL, TRUE)