-- ============================
-- 1. USERS (Admins & Staff)
-- ============================
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,  -- store hashed passwords (e.g., bcrypt)
    role VARCHAR(20) NOT NULL CHECK (role IN ('SuperAdmin','Admin','DataEntry','Auditor')),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP
);

-- ============================
-- 2. PERSONS (Beneficiaries)
-- ============================
CREATE TABLE persons (
    person_id SERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    national_id VARCHAR(50) UNIQUE NOT NULL,
    gender VARCHAR(10),
    dob DATE,
    phone_number VARCHAR(20),
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================
-- 3. PROGRAMS (Main Categories)
-- Examples: Bursaries, SMEs, FISP, Social Welfare
-- ============================
CREATE TABLE programs (
    program_id SERIAL PRIMARY KEY,
    program_name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================
-- 4. PERSON <-> PROGRAM
-- A person can belong to multiple programs
-- ============================
CREATE TABLE person_programs (
    person_program_id SERIAL PRIMARY KEY,
    person_id INT NOT NULL REFERENCES persons(person_id) ON DELETE CASCADE,
    program_id INT NOT NULL REFERENCES programs(program_id) ON DELETE CASCADE,
    start_date DATE,
    end_date DATE,
    UNIQUE (person_id, program_id)
);

-- ============================
-- 5. GROUPS (Clubs, Cooperatives, Cash4Work, etc.)
-- ============================
CREATE TABLE groups (
    group_id SERIAL PRIMARY KEY,
    group_name VARCHAR(150) UNIQUE NOT NULL,
    program_id INT REFERENCES programs(program_id) ON DELETE SET NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================
-- 6. PERSON <-> GROUP
-- Membership of a person in a specific group
-- ============================
CREATE TABLE person_groups (
    person_group_id SERIAL PRIMARY KEY,
    person_id INT NOT NULL REFERENCES persons(person_id) ON DELETE CASCADE,
    group_id INT NOT NULL REFERENCES groups(group_id) ON DELETE CASCADE,
    role VARCHAR(50), -- e.g. Member, Leader, Treasurer
    join_date DATE,
    UNIQUE (person_id, group_id)
);

-- ============================
-- 7. GRANTS & LOANS
-- Financial support given to groups
-- ============================
CREATE TABLE grants_loans (
    grant_loan_id SERIAL PRIMARY KEY,
    group_id INT NOT NULL REFERENCES groups(group_id) ON DELETE CASCADE,
    amount NUMERIC(12,2) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('Grant','Loan')),
    issued_date DATE NOT NULL,
    repayment_status VARCHAR(20) DEFAULT 'Pending' CHECK (repayment_status IN ('Pending','Repaid','Defaulted')),
    remarks TEXT
);

-- ============================
-- 8. AUDIT LOG (Tracks Admin Actions)
-- ============================
CREATE TABLE audit_logs (
    log_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(user_id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,  -- e.g., "Added Person", "Deleted Group"
    details TEXT,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================
-- 9. INDEXES (For Speed)
-- ============================
CREATE INDEX idx_persons_nationalid ON persons(national_id);
CREATE INDEX idx_programs_name ON programs(program_name);
CREATE INDEX idx_groups_name ON groups(group_name);
CREATE INDEX idx_loans_status ON grants_loans(repayment_status);
