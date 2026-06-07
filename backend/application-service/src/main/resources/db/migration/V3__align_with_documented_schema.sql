-- V3__align_with_documented_schema.sql
-- Brings application-service in line with the documented Team-2 spec:
--   1. Adds the documented per-stage timestamp / CTC / rejection / referral
--      columns to `applications`.
--   2. Adds the four documented tables that previously had no implementation:
--      interview, interview_interviewers, scorecard, offer.

-- =====================================================================
-- 1. applications: documented additional columns
-- =====================================================================
ALTER TABLE applications
    ADD COLUMN IF NOT EXISTS screening_at     TIMESTAMP,
    ADD COLUMN IF NOT EXISTS technical_at     TIMESTAMP,
    ADD COLUMN IF NOT EXISTS interview_at     TIMESTAMP,
    ADD COLUMN IF NOT EXISTS final_round_at   TIMESTAMP,
    ADD COLUMN IF NOT EXISTS offer_at         TIMESTAMP,
    ADD COLUMN IF NOT EXISTS hired_at         TIMESTAMP,
    ADD COLUMN IF NOT EXISTS rejected_at      TIMESTAMP,
    ADD COLUMN IF NOT EXISTS rejection_reason VARCHAR(100),
    ADD COLUMN IF NOT EXISTS referral_code    VARCHAR(50);

-- =====================================================================
-- 2. interview
-- =====================================================================
CREATE TABLE IF NOT EXISTS interview (
    interview_id      BIGSERIAL PRIMARY KEY,
    application_id    BIGINT NOT NULL REFERENCES applications(application_id),
    interview_type    VARCHAR(30)  NOT NULL,
    scheduled_at      TIMESTAMP    NOT NULL,
    duration_mins     INTEGER      NOT NULL,
    time_zone         VARCHAR(100) NOT NULL,
    meet_link         VARCHAR(500),
    status            VARCHAR(30)  NOT NULL,
    calendar_event_id VARCHAR(255),
    created_at        TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_interview_application ON interview(application_id);

-- =====================================================================
-- 3. interview_interviewers  (join table)
-- =====================================================================
CREATE TABLE IF NOT EXISTS interview_interviewers (
    interview_id BIGINT NOT NULL REFERENCES interview(interview_id),
    employee_id  BIGINT NOT NULL,
    PRIMARY KEY (interview_id, employee_id)
);

-- =====================================================================
-- 4. scorecard
-- =====================================================================
CREATE TABLE IF NOT EXISTS scorecard (
    scorecard_id        BIGSERIAL PRIMARY KEY,
    interview_id        BIGINT NOT NULL REFERENCES interview(interview_id),
    application_id      BIGINT NOT NULL REFERENCES applications(application_id),
    interviewer_id      BIGINT NOT NULL,
    score               INTEGER NOT NULL,
    overall_score       INTEGER NOT NULL,
    competency_ratings  JSONB   NOT NULL,
    strengths           TEXT    NOT NULL,
    concerns            TEXT,
    comments            TEXT,
    recommendation      VARCHAR(30) NOT NULL,
    submitted_at        TIMESTAMP   NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_scorecard_interview_interviewer UNIQUE (interview_id, interviewer_id)
);
CREATE INDEX IF NOT EXISTS idx_scorecard_application ON scorecard(application_id);

-- =====================================================================
-- 5. offer
-- =====================================================================
CREATE TABLE IF NOT EXISTS offer (
    offer_id        BIGSERIAL PRIMARY KEY,
    application_id  BIGINT NOT NULL UNIQUE REFERENCES applications(application_id),
    role            VARCHAR(100) NOT NULL,
    base_salary     DECIMAL      NOT NULL,
    bonus           DECIMAL,
    equity          DECIMAL,
    joining_date    DATE         NOT NULL,
    offer_status    VARCHAR(50)  NOT NULL,
    employment_type VARCHAR(50)  NOT NULL,
    approved_by     VARCHAR(100),
    rejected_by     VARCHAR(100),
    approved_at     TIMESTAMP,
    rejected_at     TIMESTAMP,
    sent_at         TIMESTAMP,
    signed_at       TIMESTAMP,
    expires_at      TIMESTAMP,
    docu_sign_id    VARCHAR(150)
);
