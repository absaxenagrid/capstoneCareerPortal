-- V1__create_notification_schema.sql
-- Notification service schema

CREATE TABLE IF NOT EXISTS notifications (
    notification_id   BIGSERIAL PRIMARY KEY,
    candidate_email   VARCHAR(150) NOT NULL,
    title             VARCHAR(300) NOT NULL,
    message           TEXT NOT NULL,
    type              VARCHAR(50) DEFAULT 'APPLICATION',   -- APPLICATION | GENERAL | SYSTEM
    reference_id      VARCHAR(100),                        -- e.g. application_id
    is_read           BOOLEAN DEFAULT FALSE,
    created_at        TIMESTAMP DEFAULT NOW(),
    updated_at        TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_notifications_email        ON notifications(candidate_email);
CREATE INDEX idx_notifications_email_unread ON notifications(candidate_email, is_read);
CREATE INDEX idx_notifications_created      ON notifications(created_at DESC);
