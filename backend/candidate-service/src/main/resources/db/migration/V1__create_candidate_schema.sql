-- V1__create_candidate_schema.sql

CREATE TABLE IF NOT EXISTS candidates (
    candidate_id   BIGSERIAL PRIMARY KEY,
    first_name     VARCHAR(100) NOT NULL,
    last_name      VARCHAR(100) NOT NULL,
    email          VARCHAR(150) NOT NULL UNIQUE,
    phone_number   VARCHAR(20),
    date_of_birth  DATE,
    gender         VARCHAR(20),
    address        TEXT,
    profile_complete BOOLEAN DEFAULT FALSE,
    deleted        BOOLEAN DEFAULT FALSE,
    created_at     TIMESTAMP DEFAULT NOW(),
    updated_at     TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS education_details (
    education_id      BIGSERIAL PRIMARY KEY,
    candidate_id      BIGINT NOT NULL REFERENCES candidates(candidate_id),
    degree            VARCHAR(100) NOT NULL,
    specialization    VARCHAR(150),
    institution_name  VARCHAR(200) NOT NULL,
    start_year        INTEGER,
    end_year          INTEGER,
    percentage        DECIMAL(5,2),
    deleted           BOOLEAN DEFAULT FALSE,
    created_at        TIMESTAMP DEFAULT NOW(),
    updated_at        TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS experience_details (
    experience_id      BIGSERIAL PRIMARY KEY,
    candidate_id       BIGINT NOT NULL REFERENCES candidates(candidate_id),
    company_name       VARCHAR(150) NOT NULL,
    designation        VARCHAR(150) NOT NULL,
    employment_type    VARCHAR(50),
    start_date         DATE,
    end_date           DATE,
    currently_working  BOOLEAN DEFAULT FALSE,
    responsibilities   TEXT,
    deleted            BOOLEAN DEFAULT FALSE,
    created_at         TIMESTAMP DEFAULT NOW(),
    updated_at         TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS candidate_skills (
    skill_id     BIGSERIAL PRIMARY KEY,
    candidate_id BIGINT NOT NULL REFERENCES candidates(candidate_id),
    skill_name   VARCHAR(100) NOT NULL,
    deleted      BOOLEAN DEFAULT FALSE,
    created_at   TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS certifications (
    certification_id      BIGSERIAL PRIMARY KEY,
    candidate_id          BIGINT NOT NULL REFERENCES candidates(candidate_id),
    certificate_name      VARCHAR(200) NOT NULL,
    issuing_organization  VARCHAR(200),
    issued_date           DATE,
    file_path             VARCHAR(500),
    original_filename     VARCHAR(255),
    deleted               BOOLEAN DEFAULT FALSE,
    created_at            TIMESTAMP DEFAULT NOW(),
    updated_at            TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS social_links (
    social_link_id BIGSERIAL PRIMARY KEY,
    candidate_id   BIGINT NOT NULL UNIQUE REFERENCES candidates(candidate_id),
    linkedin_url   VARCHAR(500),
    github_url     VARCHAR(500),
    portfolio_url  VARCHAR(500),
    twitter_url    VARCHAR(500),
    created_at     TIMESTAMP DEFAULT NOW(),
    updated_at     TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS candidate_preferences (
    preference_id        BIGSERIAL PRIMARY KEY,
    candidate_id         BIGINT NOT NULL UNIQUE REFERENCES candidates(candidate_id),
    work_mode            VARCHAR(30),
    desired_salary_min   BIGINT,
    desired_salary_max   BIGINT,
    preferred_locations  JSONB,
    notice_period_days   INTEGER,
    willing_to_relocate  BOOLEAN DEFAULT FALSE,
    created_at           TIMESTAMP DEFAULT NOW(),
    updated_at           TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS resumes (
    resume_id         BIGSERIAL PRIMARY KEY,
    candidate_id      BIGINT NOT NULL REFERENCES candidates(candidate_id),
    object_key        VARCHAR(500) NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    is_active         BOOLEAN DEFAULT TRUE,
    version           INTEGER DEFAULT 1,
    uploaded_at       TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS skill_master (
    skill_master_id BIGSERIAL PRIMARY KEY,
    skill_name      VARCHAR(100) NOT NULL UNIQUE,
    category        VARCHAR(100),
    created_at      TIMESTAMP DEFAULT NOW()
);

-- Seed common skills
INSERT INTO skill_master (skill_name, category) VALUES
('Java', 'Programming Language'),
('Java 8', 'Programming Language'),
('Java 11', 'Programming Language'),
('Java 17', 'Programming Language'),
('Java Spring Boot', 'Framework'),
('Spring Boot', 'Framework'),
('Spring MVC', 'Framework'),
('Spring Data JPA', 'Framework'),
('Spring Security', 'Framework'),
('Spring Cloud', 'Framework'),
('Python', 'Programming Language'),
('JavaScript', 'Programming Language'),
('TypeScript', 'Programming Language'),
('React', 'Frontend Framework'),
('Angular', 'Frontend Framework'),
('Vue.js', 'Frontend Framework'),
('Node.js', 'Runtime'),
('PostgreSQL', 'Database'),
('MySQL', 'Database'),
('MongoDB', 'Database'),
('Redis', 'Database'),
('Docker', 'DevOps'),
('Kubernetes', 'DevOps'),
('AWS', 'Cloud'),
('Azure', 'Cloud'),
('GCP', 'Cloud'),
('Microservices', 'Architecture'),
('REST API', 'Architecture'),
('GraphQL', 'API'),
('Kafka', 'Messaging'),
('RabbitMQ', 'Messaging'),
('Maven', 'Build Tool'),
('Gradle', 'Build Tool'),
('Git', 'Version Control'),
('CI/CD', 'DevOps'),
('PyTorch', 'ML Framework'),
('TensorFlow', 'ML Framework'),
('Machine Learning', 'AI/ML'),
('Deep Learning', 'AI/ML'),
('LLM', 'AI/ML'),
('CUDA', 'GPU Computing'),
('Terraform', 'Infrastructure'),
('Ansible', 'Infrastructure'),
('Hibernate', 'ORM'),
('JUnit', 'Testing'),
('Mockito', 'Testing')
ON CONFLICT (skill_name) DO NOTHING;

CREATE INDEX idx_candidates_email ON candidates(email);
CREATE INDEX idx_education_candidate ON education_details(candidate_id);
CREATE INDEX idx_experience_candidate ON experience_details(candidate_id);
CREATE INDEX idx_skills_candidate ON candidate_skills(candidate_id);
CREATE INDEX idx_skill_master_name ON skill_master(skill_name);
CREATE INDEX idx_resumes_candidate ON resumes(candidate_id);
