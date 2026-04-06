-- 1. USERS TABLE

CREATE TABLE users (
  id SERIAL PRIMARY KEY
  , username VARCHAR(100) NOT NULL
  , email VARCHAR(150) UNIQUE NOT NULL
  , password TEXT NOT NULL
  , role VARCHAR(20) CHECK (role IN ('VIEWER', 'ANALYST', 'ADMIN')) DEFAULT 'VIEWER'
  , status VARCHAR(20) CHECK (status IN ('ACTIVE', 'INACTIVE')) DEFAULT 'ACTIVE'
  , created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- 2. TYPES TABLE (INCOME / EXPENSE)
CREATE TABLE types (id SERIAL PRIMARY KEY, name VARCHAR(20) UNIQUE NOT NULL);

-- Insert default values
INSERT INTO
  types (name)
VALUES
  ('INCOME')
  , ('EXPENSE');


-- 3. CATEGORIES TABLE

CREATE TABLE categories (id SERIAL PRIMARY KEY, name VARCHAR(100) UNIQUE NOT NULL);

-- Sample categories (optional)
INSERT INTO
  categories (name)
VALUES
  ('Food')
  , ('Utilities')
  , ('Salary')
  , ('Logistics')
  , ('Investment')
  , ('Rental')
  , ('Tax')
  , ('IMarketing')
  , ('Loan');


-- 4. FINANCE RECORDS TABLE
CREATE TABLE records (
  id SERIAL PRIMARY KEY
  , user_id INT NOT NULL
  , amount NUMERIC(10, 2) NOT NULL CHECK (amount >= 0)
  , type_id INT NOT NULL
  , category_id INT NOT NULL
  , record_date DATE NOT NULL
  , description TEXT
  , created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  , updated_at TIMESTAMP
  , deleted_at TIMESTAMP
  , is_deleted BOOLEAN DEFAULT FALSE
  , -- Foreign Keys
    CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id)
  ON DELETE CASCADE
  , CONSTRAINT fk_type FOREIGN KEY (type_id) REFERENCES types(id)
  , CONSTRAINT fk_category FOREIGN KEY (category_id) REFERENCES categories(id)
);


-- INDEXES
-- Users
CREATE INDEX idx_users_email
ON users(email);

-- Finance Records Indexes
CREATE INDEX idx_records_user_id
ON records(user_id);
CREATE INDEX idx_records_type_id
ON records(type_id);
CREATE INDEX idx_records_category_id
ON records(category_id);
CREATE INDEX idx_records_date
ON records(record_date);

-- Composite Index
CREATE INDEX idx_user_date
ON records(user_id, record_date);
