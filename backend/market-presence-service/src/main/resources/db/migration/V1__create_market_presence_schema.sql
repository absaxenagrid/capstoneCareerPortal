-- V1__create_market_presence_schema.sql
-- Team-3: Market Presence / Core Portal (team-3-schema)
-- Implements the documented job-posting and public-portal tables.

-- =====================================================================
-- 1. job_postings
-- =====================================================================
CREATE TABLE IF NOT EXISTS job_postings (
    id                BIGSERIAL PRIMARY KEY,
    demand_id         BIGINT,
    role_title        VARCHAR(255),
    slug              VARCHAR(255) UNIQUE,
    description       TEXT,
    skills_required   TEXT,
    responsibilities  TEXT,
    benefits          TEXT,
    employment_type   VARCHAR(50),   -- FULL_TIME / PART_TIME / CONTRACT / INTERN
    experience_level  VARCHAR(50),   -- ENTRY / MID / SENIOR / LEAD / PRINCIPAL
    experience_years  VARCHAR(50),
    work_mode         VARCHAR(50),   -- REMOTE / ONSITE / HYBRID
    location_city     VARCHAR(150),
    location_state    VARCHAR(150),
    location_country  VARCHAR(150),
    department        VARCHAR(150),
    job_category      VARCHAR(150),
    salary_min        NUMERIC(15,2),
    salary_max        NUMERIC(15,2),
    currency          VARCHAR(100),
    show_salary       BOOLEAN DEFAULT FALSE,
    posting_status    VARCHAR(50) DEFAULT 'DRAFT', -- DRAFT/PUBLISHED/CLOSED/ARCHIVED
    meta_title        VARCHAR(255),
    meta_description  VARCHAR(500),
    published_at      TIMESTAMPTZ,
    closed_at         TIMESTAMPTZ,
    expires_at        TIMESTAMPTZ,
    created_by        BIGINT,
    updated_by        BIGINT,
    is_deleted        BOOLEAN DEFAULT FALSE,
    created_at        TIMESTAMP DEFAULT NOW(),
    updated_at        TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_job_postings_demand  ON job_postings(demand_id);
CREATE INDEX IF NOT EXISTS idx_job_postings_status  ON job_postings(posting_status);
CREATE INDEX IF NOT EXISTS idx_job_postings_slug    ON job_postings(slug);

-- =====================================================================
-- 2. job_posting_versions
-- =====================================================================
CREATE TABLE IF NOT EXISTS job_posting_versions (
    id              BIGSERIAL PRIMARY KEY,
    job_posting_id  BIGINT NOT NULL REFERENCES job_postings(id),
    version_number  INTEGER NOT NULL,
    snapshot        JSONB,
    change_summary  TEXT,
    changed_by      BIGINT,
    changed_at      TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_jpv_posting ON job_posting_versions(job_posting_id);

-- =====================================================================
-- 3. job_posting_channels
-- =====================================================================
CREATE TABLE IF NOT EXISTS job_posting_channels (
    id                  BIGSERIAL PRIMARY KEY,
    job_posting_id      BIGINT NOT NULL REFERENCES job_postings(id),
    channel_name        VARCHAR(100), -- CAREERS_PORTAL/LINKEDIN/INDEED/GLASSDOOR/NAUKRI
    external_posting_id VARCHAR(255),
    external_url        TEXT,
    sync_status         VARCHAR(50),  -- PENDING/PUBLISHED/FAILED/REMOVED
    published_at        TIMESTAMPTZ,
    last_synced_at      TIMESTAMPTZ,
    error_message       TEXT,
    created_at          TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_jpc_posting ON job_posting_channels(job_posting_id);

-- =====================================================================
-- 4. job_posting_analytics
-- =====================================================================
CREATE TABLE IF NOT EXISTS job_posting_analytics (
    id                     BIGSERIAL PRIMARY KEY,
    job_posting_id         BIGINT NOT NULL REFERENCES job_postings(id),
    analytics_date         DATE NOT NULL,
    total_views            INTEGER DEFAULT 0,
    unique_views           INTEGER DEFAULT 0,
    apply_clicks           INTEGER DEFAULT 0,
    applications_started   INTEGER DEFAULT 0,
    applications_submitted INTEGER DEFAULT 0,
    saved_count            INTEGER DEFAULT 0,
    share_count            INTEGER DEFAULT 0,
    top_referrer           VARCHAR(255),
    top_country            VARCHAR(10),
    created_at             TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_jpa_posting_date UNIQUE (job_posting_id, analytics_date)
);

-- =====================================================================
-- 5. apply_sessions
-- =====================================================================
CREATE TABLE IF NOT EXISTS apply_sessions (
    id                  BIGSERIAL PRIMARY KEY,
    job_posting_id      BIGINT NOT NULL REFERENCES job_postings(id),
    session_token       VARCHAR(255) UNIQUE,
    candidate_email     VARCHAR(255),
    candidate_phone     VARCHAR(50),
    form_data           JSONB,
    current_step        INTEGER,
    resume_s3_key       VARCHAR(500),
    resume_file_name    VARCHAR(255),
    resume_size_bytes   BIGINT,
    consent_accepted    BOOLEAN DEFAULT FALSE,
    consent_accepted_at TIMESTAMPTZ,
    session_status      VARCHAR(50), -- IN_PROGRESS/SUBMITTED/ABANDONED/EXPIRED
    ip_address          INET,
    user_agent          TEXT,
    started_at          TIMESTAMPTZ,
    submitted_at        TIMESTAMPTZ,
    expires_at          TIMESTAMPTZ,
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_apply_sessions_posting ON apply_sessions(job_posting_id);

-- =====================================================================
-- 6. saved_jobs
-- =====================================================================
CREATE TABLE IF NOT EXISTS saved_jobs (
    id                   BIGSERIAL PRIMARY KEY,
    job_posting_id       BIGINT NOT NULL REFERENCES job_postings(id),
    candidate_email      VARCHAR(255) NOT NULL,
    save_token           VARCHAR(255),
    notification_enabled BOOLEAN DEFAULT TRUE,
    saved_at             TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_saved_jobs_posting_email UNIQUE (job_posting_id, candidate_email)
);

-- =====================================================================
-- 7. job_referrals
-- =====================================================================
CREATE TABLE IF NOT EXISTS job_referrals (
    id                    BIGSERIAL PRIMARY KEY,
    job_posting_id        BIGINT NOT NULL REFERENCES job_postings(id),
    referred_by           BIGINT,
    candidate_name        VARCHAR(255),
    candidate_email       VARCHAR(255),
    candidate_phone       VARCHAR(50),
    relationship          VARCHAR(100),
    referral_note         TEXT,
    referral_code         VARCHAR(50) UNIQUE,
    referral_status       VARCHAR(50), -- SUBMITTED/CONTACTED/APPLIED/INTERVIEWED/HIRED/REJECTED
    application_intake_id BIGINT,
    bonus_eligible        BOOLEAN DEFAULT FALSE,
    bonus_amount          NUMERIC(15,2),
    bonus_paid            BOOLEAN DEFAULT FALSE,
    status_updated_at     TIMESTAMPTZ,
    created_at            TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_job_referrals_posting ON job_referrals(job_posting_id);
CREATE INDEX IF NOT EXISTS idx_job_referrals_code    ON job_referrals(referral_code);
