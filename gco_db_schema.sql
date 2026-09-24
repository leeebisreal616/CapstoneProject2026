-- ============================================================
-- GCO Portal Dummy Database Schema
-- For XAMPP / phpMyAdmin (MySQL)
-- Fallback database in case MIS/IT does not provide one.
-- Mirrors the frontend mock data structures already built.
-- ============================================================

CREATE DATABASE IF NOT EXISTS gco_portal;
USE gco_portal;

-- ------------------------------------------------------------
-- STUDENTS
-- ------------------------------------------------------------
CREATE TABLE students (
    student_id VARCHAR(9) PRIMARY KEY,        -- e.g. 202311325, no dashes
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    middle_initial VARCHAR(5),
    course VARCHAR(50) NOT NULL,               -- e.g. BSIT
    year_level VARCHAR(20) NOT NULL,            -- e.g. 3rd Year
    section VARCHAR(10),                        -- e.g. 3-E
    email VARCHAR(100),
    contact_no VARCHAR(15),
    sex ENUM('Male','Female'),
    civil_status VARCHAR(20),
    birthdate DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------
-- ADMIN USERS (replaces hardcoded admin/gco2026 demo auth)
-- ------------------------------------------------------------
CREATE TABLE admin_users (
    admin_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,        -- store hashed, never plain text
    full_name VARCHAR(100) NOT NULL,
    role VARCHAR(50) DEFAULT 'Guidance Counselor',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------
-- APPOINTMENTS (Counseling Request Form / OSAS-QF-06)
-- ------------------------------------------------------------
CREATE TABLE appointments (
    appointment_id INT AUTO_INCREMENT PRIMARY KEY,
    student_id VARCHAR(9) NOT NULL,
    concern_type VARCHAR(50),
    reason TEXT,                                 -- checkboxes joined as CSV or JSON
    counselor_gender_pref VARCHAR(20),
    language_pref VARCHAR(20),
    preferred_day VARCHAR(50),
    preferred_time VARCHAR(50),
    emergency_contact_name VARCHAR(100),
    emergency_contact_no VARCHAR(15),
    consent_keep_records BOOLEAN,
    consent_confidentiality_understood BOOLEAN,
    status ENUM('Pending','Approved','Declined','Completed') DEFAULT 'Pending',
    date_submitted TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(student_id)
);

-- ------------------------------------------------------------
-- NEEDS ASSESSMENT SUBMISSIONS
-- ------------------------------------------------------------
CREATE TABLE needs_assessment (
    submission_id INT AUTO_INCREMENT PRIMARY KEY,
    student_id VARCHAR(9) NOT NULL,
    age INT,
    sex ENUM('Male','Female'),
    academic_needs TEXT,                         -- JSON array of checked options
    social_needs TEXT,
    career_needs VARCHAR(255),
    priority_concern TEXT,
    self_rated_wellbeing VARCHAR(20),
    status ENUM('Pending Review','Reviewed') DEFAULT 'Pending Review',
    date_submitted TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(student_id)
);

-- ------------------------------------------------------------
-- STUDENT PROFILE INVENTORY SUBMISSIONS
-- ------------------------------------------------------------
CREATE TABLE student_profile (
    submission_id INT AUTO_INCREMENT PRIMARY KEY,
    student_id VARCHAR(9) NOT NULL,
    nickname VARCHAR(50),
    place_of_birth VARCHAR(100),
    religion VARCHAR(50),
    home_address TEXT,
    college_department VARCHAR(100),
    year_admitted YEAR,
    scholarship_status VARCHAR(100),
    father_name VARCHAR(100),
    father_occupation VARCHAR(100),
    mother_name VARCHAR(100),
    mother_occupation VARCHAR(100),
    guardian_name VARCHAR(100),
    monthly_family_income VARCHAR(50),
    number_of_siblings INT,
    birth_order VARCHAR(20),
    health_condition TEXT,
    status ENUM('Pending Review','Reviewed') DEFAULT 'Pending Review',
    date_submitted TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(student_id)
);

-- ------------------------------------------------------------
-- ASSESSMENT RESULTS (Personality / Well-Being exams)
-- ------------------------------------------------------------
CREATE TABLE assessment_results (
    result_id INT AUTO_INCREMENT PRIMARY KEY,
    student_id VARCHAR(9) NOT NULL,
    exam_type ENUM('Personality','Well-Being') NOT NULL,
    score INT,
    result_label VARCHAR(100),                    -- e.g. "Needs Attention"
    flag_level ENUM('Normal','Monitor','Needs Attention') DEFAULT 'Normal',
    date_taken TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(student_id)
);

-- ------------------------------------------------------------
-- ANNOUNCEMENTS
-- ------------------------------------------------------------
CREATE TABLE announcements (
    announcement_id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    description TEXT,
    status ENUM('Draft','Published') DEFAULT 'Draft',
    created_by INT,                                -- FK to admin_users
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES admin_users(admin_id)
);

-- ------------------------------------------------------------
-- MODULES (Information Service: Academic / PSE / Career)
-- ------------------------------------------------------------
CREATE TABLE modules (
    module_id INT AUTO_INCREMENT PRIMARY KEY,
    category ENUM('Academic','Personal-Social-Emotional','Career') NOT NULL,
    title VARCHAR(150) NOT NULL,
    content TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------
-- SAMPLE DUMMY DATA (mirrors what's currently in the frontend mock data)
-- ------------------------------------------------------------
INSERT INTO students (student_id, first_name, last_name, course, year_level, section, sex) VALUES
('202311325', 'Juan', 'Dela Cruz', 'BSIT', '3rd Year', '3-E', 'Male'),
('202211102', 'Maria', 'Santos', 'BSED', '2nd Year', '2-A', 'Female'),
('202411567', 'Pedro', 'Reyes', 'BSCE', '1st Year', '1-B', 'Male'),
('202310988', 'Ana', 'Lopez', 'BSIT', '4th Year', '4-C', 'Female');

INSERT INTO admin_users (username, password_hash, full_name) VALUES
('admin', 'REPLACE_WITH_HASHED_PASSWORD', 'Jervin M.');
