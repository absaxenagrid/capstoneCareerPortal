-- V2__align_with_documented_schema.sql
-- Brings candidate-service schema in line with the documented Team-2 spec.
--   1. Rename `candidates` -> `external_candidate` and add the documented
--      experience / CTC / source / hashing / GDPR-PII audit columns.
--   2. Rebuild `social_links` from column-per-platform to the documented
--      row-per-link model with a UNIQUE(candidate_id, social) constraint.
-- NOTE: this migration is written to be safe to run on an existing DB created
-- by V1. Data in dropped columns is migrated where a sensible mapping exists.

-- =====================================================================
-- 1. external_candidate
-- =====================================================================
ALTER TABLE candidates RENAME TO external_candidate;

-- documented profile columns -----------------------------------------
ALTER TABLE external_candidate
    ADD COLUMN IF NOT EXISTS total_experience_years FLOAT,
    ADD COLUMN IF NOT EXISTS total_gap_years        FLOAT,
    ADD COLUMN IF NOT EXISTS current_ctc            BIGINT,
    ADD COLUMN IF NOT EXISTS expected_ctc           BIGINT,
    ADD COLUMN IF NOT EXISTS notice_period_days     INTEGER,
    ADD COLUMN IF NOT EXISTS willing_to_relocate    BOOLEAN,
    ADD COLUMN IF NOT EXISTS free_notes             TEXT,
    ADD COLUMN IF NOT EXISTS source                 VARCHAR(50),
    ADD COLUMN IF NOT EXISTS email_hash             VARCHAR(64),
    ADD COLUMN IF NOT EXISTS phone_hash             VARCHAR(64);

-- GDPR / PII / soft-delete audit block --------------------------------
ALTER TABLE external_candidate
    ADD COLUMN IF NOT EXISTS is_deleted                 BOOLEAN     NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS deleted_at                 TIMESTAMP,
    ADD COLUMN IF NOT EXISTS deleted_by                 VARCHAR(100),
    ADD COLUMN IF NOT EXISTS delete_reason              TEXT,
    ADD COLUMN IF NOT EXISTS pii_anonymized             BOOLEAN     NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS pii_anonymized_at          TIMESTAMP,
    ADD COLUMN IF NOT EXISTS gdpr_delete_requested      BOOLEAN     NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS gdpr_delete_requested_at   TIMESTAMP,
    ADD COLUMN IF NOT EXISTS gdpr_delete_due_at         TIMESTAMP;

-- carry the old `deleted` flag into the documented `is_deleted` -------
UPDATE external_candidate SET is_deleted = COALESCE(deleted, FALSE);

-- backfill source so the documented NOT NULL can be enforced ---------
UPDATE external_candidate SET source = 'PORTAL' WHERE source IS NULL;
ALTER TABLE external_candidate ALTER COLUMN source SET NOT NULL;

-- drop columns that are not part of the documented spec ---------------
ALTER TABLE external_candidate
    DROP COLUMN IF EXISTS address,
    DROP COLUMN IF EXISTS profile_complete,
    DROP COLUMN IF EXISTS deleted;

-- documented hashing uniqueness (partial: only when populated) -------
CREATE UNIQUE INDEX IF NOT EXISTS uq_external_candidate_email_hash
    ON external_candidate(email_hash) WHERE email_hash IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS uq_external_candidate_phone_hash
    ON external_candidate(phone_hash) WHERE phone_hash IS NOT NULL;

-- =====================================================================
-- 2. social_links  (row-per-link model)
-- =====================================================================
-- Preserve any existing rows, then reshape.
CREATE TABLE IF NOT EXISTS social_links_new (
    social_links_id BIGSERIAL PRIMARY KEY,
    candidate_id    BIGINT NOT NULL REFERENCES external_candidate(candidate_id),
    social          VARCHAR(50)  NOT NULL,
    links           VARCHAR(500) NOT NULL,
    CONSTRAINT uq_social_links_candidate_social UNIQUE (candidate_id, social)
);

-- migrate the four old platform columns into individual rows ----------
INSERT INTO social_links_new (candidate_id, social, links)
SELECT candidate_id, 'LINKEDIN', linkedin_url FROM social_links WHERE linkedin_url IS NOT NULL
UNION ALL
SELECT candidate_id, 'GITHUB', github_url     FROM social_links WHERE github_url IS NOT NULL
UNION ALL
SELECT candidate_id, 'PORTFOLIO', portfolio_url FROM social_links WHERE portfolio_url IS NOT NULL
UNION ALL
SELECT candidate_id, 'TWITTER', twitter_url   FROM social_links WHERE twitter_url IS NOT NULL
ON CONFLICT (candidate_id, social) DO NOTHING;

DROP TABLE social_links;
ALTER TABLE social_links_new RENAME TO social_links;

CREATE INDEX IF NOT EXISTS idx_social_links_candidate ON social_links(candidate_id);
