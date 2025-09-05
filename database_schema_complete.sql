-- ===============================================
-- COUNCIL BENEFICIARIES MANAGEMENT SYSTEM
-- COMPLETE DATABASE SCHEMA
-- ===============================================

-- ============================
-- 1. USERS (Authentication & Authorization)
-- ============================
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('SuperAdmin','Admin','DataEntry','Auditor')),
    is_active BOOLEAN DEFAULT TRUE,
    email_verified BOOLEAN DEFAULT FALSE,
    profile_picture VARCHAR(255),
    phone_number VARCHAR(20),
    department VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP,
    password_changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================
-- 2. PASSWORD RESET TOKENS
-- ============================
CREATE TABLE password_reset_tokens (
    token_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================
-- 3. EMAIL VERIFICATION TOKENS
-- ============================
CREATE TABLE email_verification_tokens (
    token_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================
-- 4. USER SESSIONS (JWT Token Management)
-- ============================
CREATE TABLE user_sessions (
    session_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL,
    device_info TEXT,
    ip_address VARCHAR(45),
    expires_at TIMESTAMP NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================
-- 5. PERSONS (Beneficiaries)
-- ============================
CREATE TABLE persons (
    person_id SERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    national_id VARCHAR(50) UNIQUE NOT NULL,
    gender VARCHAR(10) CHECK (gender IN ('Male', 'Female', 'Other')),
    dob DATE,
    phone_number VARCHAR(20),
    email VARCHAR(100),
    address TEXT,
    district VARCHAR(100),
    province VARCHAR(100),
    marital_status VARCHAR(20) CHECK (marital_status IN ('Single', 'Married', 'Divorced', 'Widowed')),
    employment_status VARCHAR(50),
    income_level VARCHAR(50),
    disability_status BOOLEAN DEFAULT FALSE,
    created_by INT REFERENCES users(user_id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
);

-- ============================
-- 6. PROGRAMS (Main Categories)
-- ============================
CREATE TABLE programs (
    program_id SERIAL PRIMARY KEY,
    program_name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    program_type VARCHAR(50) CHECK (program_type IN ('Education', 'Health', 'Agriculture', 'Social Welfare', 'Economic Development', 'Infrastructure')),
    target_audience TEXT,
    eligibility_criteria TEXT,
    budget_allocation NUMERIC(15,2),
    start_date DATE,
    end_date DATE,
    status VARCHAR(20) DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive', 'Suspended', 'Completed')),
    created_by INT REFERENCES users(user_id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================
-- 7. PERSON <-> PROGRAM (Enrollment)
-- ============================
CREATE TABLE person_programs (
    person_program_id SERIAL PRIMARY KEY,
    person_id INT NOT NULL REFERENCES persons(person_id) ON DELETE CASCADE,
    program_id INT NOT NULL REFERENCES programs(program_id) ON DELETE CASCADE,
    enrollment_date DATE DEFAULT CURRENT_DATE,
    start_date DATE,
    end_date DATE,
    status VARCHAR(20) DEFAULT 'Active' CHECK (status IN ('Active', 'Completed', 'Suspended', 'Withdrawn')),
    benefits_received TEXT,
    amount_disbursed NUMERIC(12,2) DEFAULT 0,
    created_by INT REFERENCES users(user_id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (person_id, program_id)
);

-- ============================
-- 8. GROUPS (Cooperatives, Clubs, etc.)
-- ============================
CREATE TABLE groups (
    group_id SERIAL PRIMARY KEY,
    group_name VARCHAR(150) UNIQUE NOT NULL,
    program_id INT REFERENCES programs(program_id) ON DELETE SET NULL,
    description TEXT,
    group_type VARCHAR(50) CHECK (group_type IN ('Cooperative', 'Club', 'Association', 'Self-Help Group', 'Youth Group', 'Women Group')),
    registration_number VARCHAR(100),
    district VARCHAR(100),
    province VARCHAR(100),
    contact_person VARCHAR(100),
    contact_phone VARCHAR(20),
    contact_email VARCHAR(100),
    membership_fee NUMERIC(10,2) DEFAULT 0,
    status VARCHAR(20) DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive', 'Suspended', 'Dissolved')),
    created_by INT REFERENCES users(user_id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================
-- 9. PERSON <-> GROUP (Membership)
-- ============================
CREATE TABLE person_groups (
    person_group_id SERIAL PRIMARY KEY,
    person_id INT NOT NULL REFERENCES persons(person_id) ON DELETE CASCADE,
    group_id INT NOT NULL REFERENCES groups(group_id) ON DELETE CASCADE,
    role VARCHAR(50) DEFAULT 'Member' CHECK (role IN ('Member', 'Leader', 'Treasurer', 'Secretary', 'Vice-Leader')),
    join_date DATE DEFAULT CURRENT_DATE,
    membership_fee_paid NUMERIC(10,2) DEFAULT 0,
    status VARCHAR(20) DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive', 'Suspended', 'Expelled')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (person_id, group_id)
);

-- ============================
-- 10. GRANTS & LOANS (Financial Support)
-- ============================
CREATE TABLE grants_loans (
    grant_loan_id SERIAL PRIMARY KEY,
    group_id INT NOT NULL REFERENCES groups(group_id) ON DELETE CASCADE,
    person_id INT REFERENCES persons(person_id) ON DELETE SET NULL, -- For individual loans
    amount NUMERIC(12,2) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('Grant','Loan')),
    purpose TEXT,
    issued_date DATE NOT NULL,
    due_date DATE,
    repayment_status VARCHAR(20) DEFAULT 'Pending' CHECK (repayment_status IN ('Pending','Repaid','Defaulted','Partially_Repaid')),
    interest_rate NUMERIC(5,2) DEFAULT 0,
    total_repayment_amount NUMERIC(12,2),
    amount_repaid NUMERIC(12,2) DEFAULT 0,
    remarks TEXT,
    approved_by INT REFERENCES users(user_id),
    created_by INT REFERENCES users(user_id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================
-- 11. REPAYMENT RECORDS
-- ============================
CREATE TABLE repayment_records (
    repayment_id SERIAL PRIMARY KEY,
    grant_loan_id INT NOT NULL REFERENCES grants_loans(grant_loan_id) ON DELETE CASCADE,
    amount_paid NUMERIC(12,2) NOT NULL,
    payment_date DATE NOT NULL,
    payment_method VARCHAR(50) CHECK (payment_method IN ('Cash', 'Bank Transfer', 'Mobile Money', 'Cheque')),
    reference_number VARCHAR(100),
    remarks TEXT,
    recorded_by INT REFERENCES users(user_id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================
-- 12. AUDIT LOGS (System Activity Tracking)
-- ============================
CREATE TABLE audit_logs (
    log_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(user_id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    table_name VARCHAR(50),
    record_id INT,
    old_values JSONB,
    new_values JSONB,
    details TEXT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================
-- 13. SYSTEM SETTINGS
-- ============================
CREATE TABLE system_settings (
    setting_id SERIAL PRIMARY KEY,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT,
    description TEXT,
    data_type VARCHAR(20) DEFAULT 'string' CHECK (data_type IN ('string', 'number', 'boolean', 'json')),
    is_public BOOLEAN DEFAULT FALSE,
    updated_by INT REFERENCES users(user_id),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================
-- 14. NOTIFICATIONS
-- ============================
CREATE TABLE notifications (
    notification_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error')),
    is_read BOOLEAN DEFAULT FALSE,
    action_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================
-- 15. REPORTS (Generated Reports)
-- ============================
CREATE TABLE reports (
    report_id SERIAL PRIMARY KEY,
    report_name VARCHAR(200) NOT NULL,
    report_type VARCHAR(50) NOT NULL,
    parameters JSONB,
    file_path VARCHAR(255),
    file_size BIGINT,
    generated_by INT REFERENCES users(user_id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================
-- 16. PERMISSION REQUESTS
-- ============================
CREATE TABLE permission_requests (
    request_id SERIAL PRIMARY KEY,
    requester_id INT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    target_user_id INT REFERENCES users(user_id) ON DELETE CASCADE,
    requested_permission VARCHAR(100) NOT NULL,
    reason TEXT,
    status VARCHAR(20) DEFAULT 'Pending' CHECK (status IN ('Pending', 'Approved', 'Denied')),
    reviewed_by INT REFERENCES users(user_id),
    review_comments TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reviewed_at TIMESTAMP
);

-- ============================
-- 16. INDEXES (Performance Optimization)
-- ============================

-- User indexes
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_active ON users(is_active);

-- Password reset indexes
CREATE INDEX idx_password_reset_tokens_token ON password_reset_tokens(token);
CREATE INDEX idx_password_reset_tokens_user ON password_reset_tokens(user_id);
CREATE INDEX idx_password_reset_tokens_expires ON password_reset_tokens(expires_at);

-- Email verification indexes
CREATE INDEX idx_email_verification_tokens_token ON email_verification_tokens(token);
CREATE INDEX idx_email_verification_tokens_user ON email_verification_tokens(user_id);

-- Session indexes
CREATE INDEX idx_user_sessions_user ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_token ON user_sessions(token_hash);
CREATE INDEX idx_user_sessions_active ON user_sessions(is_active);

-- Person indexes
CREATE INDEX idx_persons_nationalid ON persons(national_id);
CREATE INDEX idx_persons_name ON persons(first_name, last_name);
CREATE INDEX idx_persons_district ON persons(district);
CREATE INDEX idx_persons_province ON persons(province);
CREATE INDEX idx_persons_active ON persons(is_active);

-- Program indexes
CREATE INDEX idx_programs_name ON programs(program_name);
CREATE INDEX idx_programs_type ON programs(program_type);
CREATE INDEX idx_programs_status ON programs(status);

-- Group indexes
CREATE INDEX idx_groups_name ON groups(group_name);
CREATE INDEX idx_groups_type ON groups(group_type);
CREATE INDEX idx_groups_district ON groups(district);
CREATE INDEX idx_groups_status ON groups(status);

-- Financial indexes
CREATE INDEX idx_grants_loans_group ON grants_loans(group_id);
CREATE INDEX idx_grants_loans_person ON grants_loans(person_id);
CREATE INDEX idx_grants_loans_type ON grants_loans(type);
CREATE INDEX idx_grants_loans_status ON grants_loans(repayment_status);
CREATE INDEX idx_grants_loans_date ON grants_loans(issued_date);

-- Repayment indexes
CREATE INDEX idx_repayment_records_loan ON repayment_records(grant_loan_id);
CREATE INDEX idx_repayment_records_date ON repayment_records(payment_date);

-- Audit log indexes
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_table ON audit_logs(table_name);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at);

-- Notification indexes
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(is_read);
CREATE INDEX idx_notifications_created ON notifications(created_at);

-- ============================
-- 17. TRIGGERS (Automated Updates)
-- ============================

-- Update timestamp trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply update triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_persons_updated_at BEFORE UPDATE ON persons FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_programs_updated_at BEFORE UPDATE ON programs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_groups_updated_at BEFORE UPDATE ON groups FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_grants_loans_updated_at BEFORE UPDATE ON grants_loans FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_person_programs_updated_at BEFORE UPDATE ON person_programs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================
-- 18. VIEWS (Simplified Data Access)
-- ============================

-- User summary view
CREATE VIEW user_summary AS
SELECT 
    u.user_id,
    u.username,
    u.email,
    u.role,
    u.is_active,
    u.last_login,
    u.created_at,
    COUNT(s.session_id) as active_sessions
FROM users u
LEFT JOIN user_sessions s ON u.user_id = s.user_id AND s.is_active = true
GROUP BY u.user_id, u.username, u.email, u.role, u.is_active, u.last_login, u.created_at;

-- Beneficiary summary view
CREATE VIEW beneficiary_summary AS
SELECT 
    p.person_id,
    p.first_name,
    p.last_name,
    p.national_id,
    p.gender,
    p.district,
    p.province,
    p.created_at,
    COUNT(DISTINCT pp.program_id) as program_count,
    COUNT(DISTINCT pg.group_id) as group_count
FROM persons p
LEFT JOIN person_programs pp ON p.person_id = pp.person_id AND pp.status = 'Active'
LEFT JOIN person_groups pg ON p.person_id = pg.person_id AND pg.status = 'Active'
WHERE p.is_active = true
GROUP BY p.person_id, p.first_name, p.last_name, p.national_id, p.gender, p.district, p.province, p.created_at;

-- Financial summary view
CREATE VIEW financial_summary AS
SELECT 
    gl.grant_loan_id,
    gl.amount,
    gl.type,
    gl.issued_date,
    gl.repayment_status,
    gl.amount_repaid,
    (gl.amount - COALESCE(gl.amount_repaid, 0)) as outstanding_amount,
    g.group_name,
    p.first_name || ' ' || p.last_name as person_name
FROM grants_loans gl
LEFT JOIN groups g ON gl.group_id = g.group_id
LEFT JOIN persons p ON gl.person_id = p.person_id;

-- ============================
-- 19. INITIAL DATA (Default Settings)
-- ============================

-- Insert default system settings
INSERT INTO system_settings (setting_key, setting_value, description, data_type, is_public) VALUES
('system_name', 'Council Beneficiaries Management System', 'Name of the system', 'string', true),
('system_version', '1.0.0', 'Current system version', 'string', true),
('max_login_attempts', '5', 'Maximum login attempts before lockout', 'number', false),
('session_timeout', '3600', 'Session timeout in seconds', 'number', false),
('password_min_length', '8', 'Minimum password length', 'number', true),
('password_require_special', 'true', 'Require special characters in password', 'boolean', true),
('email_verification_required', 'true', 'Require email verification for new users', 'boolean', true),
('default_currency', 'ZMW', 'Default currency for the system', 'string', true),
('backup_frequency', 'daily', 'How often to backup the database', 'string', false);

-- Insert default programs
INSERT INTO programs (program_name, description, program_type, target_audience, status) VALUES
('Bursaries', 'Educational support for students', 'Education', 'Students from low-income families', 'Active'),
('SMEs', 'Small and Medium Enterprise support', 'Economic Development', 'Small business owners and entrepreneurs', 'Active'),
('Social Welfare', 'Social welfare assistance programs', 'Social Welfare', 'Vulnerable and disadvantaged individuals', 'Active'),
('FISP', 'Farm Input Support Programme', 'Agriculture', 'Small-scale farmers', 'Active'),
('Cooperatives', 'Cooperative development programs', 'Economic Development', 'Cooperative groups and members', 'Active'),
('Youth Clubs', 'Youth and community clubs', 'Social Welfare', 'Youth aged 15-35', 'Active');

-- ============================
-- 20. SECURITY POLICIES
-- ============================

-- Row Level Security (RLS) policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE persons ENABLE ROW LEVEL SECURITY;
ALTER TABLE programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE grants_loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Create policies based on user roles
-- (These would be implemented based on specific security requirements)

-- ============================
-- 21. FUNCTIONS (Utility Functions)
-- ============================

-- Function to get user permissions
CREATE OR REPLACE FUNCTION get_user_permissions(user_role VARCHAR)
RETURNS TABLE(permission VARCHAR) AS $$
BEGIN
    RETURN QUERY
    SELECT unnest(ARRAY[
        CASE WHEN user_role IN ('SuperAdmin', 'Admin', 'DataEntry') THEN 'manage_beneficiaries' END,
        CASE WHEN user_role IN ('SuperAdmin', 'Admin') THEN 'manage_programs' END,
        CASE WHEN user_role IN ('SuperAdmin', 'Admin', 'DataEntry') THEN 'manage_groups' END,
        CASE WHEN user_role IN ('SuperAdmin', 'Admin') THEN 'manage_loans' END,
        CASE WHEN user_role IN ('SuperAdmin', 'Admin', 'DataEntry', 'Auditor') THEN 'view_reports' END,
        CASE WHEN user_role = 'SuperAdmin' THEN 'manage_users' END,
        CASE WHEN user_role = 'SuperAdmin' THEN 'system_settings' END
    ]) as permission
    WHERE unnest(ARRAY[
        CASE WHEN user_role IN ('SuperAdmin', 'Admin', 'DataEntry') THEN 'manage_beneficiaries' END,
        CASE WHEN user_role IN ('SuperAdmin', 'Admin') THEN 'manage_programs' END,
        CASE WHEN user_role IN ('SuperAdmin', 'Admin', 'DataEntry') THEN 'manage_groups' END,
        CASE WHEN user_role IN ('SuperAdmin', 'Admin') THEN 'manage_loans' END,
        CASE WHEN user_role IN ('SuperAdmin', 'Admin', 'DataEntry', 'Auditor') THEN 'view_reports' END,
        CASE WHEN user_role = 'SuperAdmin' THEN 'manage_users' END,
        CASE WHEN user_role = 'SuperAdmin' THEN 'system_settings' END
    ]) IS NOT NULL;
END;
$$ LANGUAGE plpgsql;

-- Function to clean expired tokens
CREATE OR REPLACE FUNCTION clean_expired_tokens()
RETURNS void AS $$
BEGIN
    DELETE FROM password_reset_tokens WHERE expires_at < CURRENT_TIMESTAMP;
    DELETE FROM email_verification_tokens WHERE expires_at < CURRENT_TIMESTAMP;
    DELETE FROM user_sessions WHERE expires_at < CURRENT_TIMESTAMP;
END;
$$ LANGUAGE plpgsql;

-- ============================
-- 22. COMMENTS (Documentation)
-- ============================

COMMENT ON TABLE users IS 'System users with authentication and authorization';
COMMENT ON TABLE password_reset_tokens IS 'Temporary tokens for password reset functionality';
COMMENT ON TABLE email_verification_tokens IS 'Temporary tokens for email verification';
COMMENT ON TABLE user_sessions IS 'Active user sessions for JWT token management';
COMMENT ON TABLE persons IS 'Beneficiaries and individuals in the system';
COMMENT ON TABLE programs IS 'Government programs and initiatives';
COMMENT ON TABLE person_programs IS 'Enrollment of persons in programs';
COMMENT ON TABLE groups IS 'Cooperatives, clubs, and community groups';
COMMENT ON TABLE person_groups IS 'Membership of persons in groups';
COMMENT ON TABLE grants_loans IS 'Financial support provided to groups or individuals';
COMMENT ON TABLE repayment_records IS 'Records of loan repayments';
COMMENT ON TABLE audit_logs IS 'System activity and change tracking';
COMMENT ON TABLE system_settings IS 'Configurable system settings';
COMMENT ON TABLE notifications IS 'User notifications and alerts';
COMMENT ON TABLE reports IS 'Generated reports and exports';

-- ============================
-- END OF SCHEMA
-- ============================
