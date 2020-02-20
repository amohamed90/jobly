CREATE TABLE companies (
  handle text PRIMARY KEY,
  name text NOT NULL UNIQUE,
  num_employees INTEGER,
  description text,
  logo_url text
)

CREATE TABLE jobs (
  id SERIAL PRIMARY KEY,
  title text NOT NULL,
  salary float NOT NULL,
  equity float NOT NULL CHECK (equity <= 1),
  company_handle text NOT NULL REFERENCES companies,
  data_posted DATETIME DEFAULT CURRENT_TIMESTAMP
)