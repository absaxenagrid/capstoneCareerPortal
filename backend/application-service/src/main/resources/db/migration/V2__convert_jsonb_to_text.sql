-- V2__convert_jsonb_to_text.sql
-- Convert JSONB snapshot columns to TEXT so Hibernate can write plain strings.
-- Safe: JSONB -> TEXT cast is lossless in PostgreSQL.

ALTER TABLE application_profile_snapshots
    ALTER COLUMN preferred_locations  TYPE TEXT USING preferred_locations::TEXT,
    ALTER COLUMN education_json       TYPE TEXT USING education_json::TEXT,
    ALTER COLUMN experience_json      TYPE TEXT USING experience_json::TEXT,
    ALTER COLUMN skills_json          TYPE TEXT USING skills_json::TEXT,
    ALTER COLUMN certifications_json  TYPE TEXT USING certifications_json::TEXT,
    ALTER COLUMN social_links_json    TYPE TEXT USING social_links_json::TEXT;
