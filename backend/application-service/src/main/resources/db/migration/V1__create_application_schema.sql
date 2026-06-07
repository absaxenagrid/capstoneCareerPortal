-- V1__create_application_schema.sql

CREATE TABLE IF NOT EXISTS applications (
    application_id           BIGSERIAL PRIMARY KEY,
    candidate_email          VARCHAR(150) NOT NULL,
    candidate_id             BIGINT,
    job_id                   BIGINT NOT NULL,
    job_title                VARCHAR(300),
    resume_file_path         VARCHAR(500),
    resume_original_filename VARCHAR(255),
    source                   VARCHAR(50)  DEFAULT 'PORTAL',
    free_notes               TEXT,
    current_stage            VARCHAR(50)  DEFAULT 'APPLIED',
    ai_rationale             TEXT,
    ai_score                 INTEGER,
    stage_move_reason        TEXT,
    applied_at               TIMESTAMP    DEFAULT NOW(),
    last_updated_at          TIMESTAMP    DEFAULT NOW(),
    blocked_from_reapply     BOOLEAN      DEFAULT FALSE,
    UNIQUE(candidate_email, job_id)
);

CREATE TABLE IF NOT EXISTS application_profile_snapshots (
    snapshot_id             BIGSERIAL PRIMARY KEY,
    application_id          BIGINT NOT NULL REFERENCES applications(application_id),
    candidate_name          VARCHAR(200),
    email                   VARCHAR(150),
    phone_number            VARCHAR(20),
    location                VARCHAR(300),
    total_experience_years  FLOAT,
    current_ctc             BIGINT,
    expected_ctc            BIGINT,
    notice_period_days      INTEGER,
    work_mode               VARCHAR(30),
    preferred_locations     TEXT,
    legally_authorized      BOOLEAN,
    willing_to_relocate     BOOLEAN,
    additional_comments     TEXT,
    education_json          TEXT,
    experience_json         TEXT,
    skills_json             TEXT,
    certifications_json     TEXT,
    social_links_json       TEXT,
    created_at              TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS application_matched_skills (
    id              BIGSERIAL PRIMARY KEY,
    application_id  BIGINT NOT NULL REFERENCES applications(application_id),
    skill           VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS application_missing_skills (
    id              BIGSERIAL PRIMARY KEY,
    application_id  BIGINT NOT NULL REFERENCES applications(application_id),
    skill           VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS application_status_history (
    history_id      BIGSERIAL PRIMARY KEY,
    application_id  BIGINT NOT NULL REFERENCES applications(application_id),
    from_stage      VARCHAR(50),
    to_stage        VARCHAR(50) NOT NULL,
    moved_by        VARCHAR(100),
    reason          TEXT,
    moved_at        TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_applications_email    ON applications(candidate_email);
CREATE INDEX IF NOT EXISTS idx_applications_job      ON applications(job_id);
CREATE INDEX IF NOT EXISTS idx_applications_stage    ON applications(current_stage);
CREATE INDEX IF NOT EXISTS idx_applications_applied  ON applications(applied_at DESC);
CREATE INDEX IF NOT EXISTS idx_snapshot_application  ON application_profile_snapshots(application_id);
