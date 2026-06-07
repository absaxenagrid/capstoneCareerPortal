# Forge Careers Portal — Complete Database Schema

## Databases

| Database           | Service             | Description                          |
|--------------------|---------------------|--------------------------------------|
| `candidate_db`       | candidate-service       | Candidate profiles, resumes          |
| `application_db`     | application-service     | Applications, interviews, offers     |
| `market_presence_db` | market-presence-service | Job postings, portal, referrals      |
| `file_db`            | file-service            | File metadata (MinIO)                |
| `notification_db`    | notification-service    | In-app + email notifications         |

---

## candidate_db

### external_candidate
| Column                    | Type           | Notes                          |
|---------------------------|----------------|--------------------------------|
| candidate_id              | BIGSERIAL PK   |                                |
| first_name                | VARCHAR(100)   | NOT NULL                       |
| last_name                 | VARCHAR(100)   | NOT NULL                       |
| email                     | VARCHAR(150)   | UNIQUE, NOT NULL               |
| phone_number              | VARCHAR(20)    |                                |
| date_of_birth             | DATE           |                                |
| gender                    | VARCHAR(20)    |                                |
| total_experience_years    | FLOAT          |                                |
| total_gap_years           | FLOAT          |                                |
| current_ctc               | BIGINT         |                                |
| expected_ctc              | BIGINT         |                                |
| notice_period_days        | INTEGER        |                                |
| willing_to_relocate       | BOOLEAN        |                                |
| free_notes                | TEXT           |                                |
| source                    | VARCHAR(50)    | NOT NULL, DEFAULT 'PORTAL'     |
| email_hash                | VARCHAR(64)    | UNIQUE (when populated)        |
| phone_hash                | VARCHAR(64)    | UNIQUE (when populated)        |
| is_deleted                | BOOLEAN        | NOT NULL, DEFAULT FALSE        |
| deleted_at                | TIMESTAMP      |                                |
| deleted_by                | VARCHAR(100)   |                                |
| delete_reason             | TEXT           |                                |
| pii_anonymized            | BOOLEAN        | NOT NULL, DEFAULT FALSE        |
| pii_anonymized_at         | TIMESTAMP      |                                |
| gdpr_delete_requested     | BOOLEAN        | NOT NULL, DEFAULT FALSE        |
| gdpr_delete_requested_at  | TIMESTAMP      |                                |
| gdpr_delete_due_at        | TIMESTAMP      |                                |
| created_at                | TIMESTAMP      | DEFAULT NOW()                  |
| updated_at                | TIMESTAMP      | DEFAULT NOW()                  |

### education_details
| Column           | Type           | Notes                          |
|------------------|----------------|--------------------------------|
| education_id     | BIGSERIAL PK   |                                |
| candidate_id     | BIGINT FK      | → external_candidate                 |
| degree           | VARCHAR(100)   | NOT NULL                       |
| specialization   | VARCHAR(150)   |                                |
| institution_name | VARCHAR(200)   | NOT NULL                       |
| start_year       | INTEGER        |                                |
| end_year         | INTEGER        | graduation year                |
| percentage       | DECIMAL(5,2)   |                                |
| deleted          | BOOLEAN        | DEFAULT FALSE                  |

### experience_details
| Column            | Type           | Notes                          |
|-------------------|----------------|--------------------------------|
| experience_id     | BIGSERIAL PK   |                                |
| candidate_id      | BIGINT FK      | → external_candidate                 |
| company_name      | VARCHAR(150)   | NOT NULL                       |
| designation       | VARCHAR(150)   | NOT NULL                       |
| employment_type   | VARCHAR(50)    | Full-time / Part-time etc      |
| start_date        | DATE           |                                |
| end_date          | DATE           | NULL = still employed          |
| currently_working | BOOLEAN        | DEFAULT FALSE                  |
| responsibilities  | TEXT           |                                |
| deleted           | BOOLEAN        | DEFAULT FALSE                  |

### candidate_skills
| Column      | Type         | Notes              |
|-------------|--------------|--------------------|
| skill_id    | BIGSERIAL PK |                    |
| candidate_id| BIGINT FK    | → external_candidate     |
| skill_name  | VARCHAR(100) |                    |
| deleted     | BOOLEAN      | DEFAULT FALSE      |

### social_links
| Column         | Type         | Notes                          |
|----------------|--------------|--------------------------------|
| social_links_id| BIGSERIAL PK |                                |
| candidate_id   | BIGINT FK    | → external_candidate           |
| social         | VARCHAR(50)  | NOT NULL (LINKEDIN/GITHUB/...) |
| links          | VARCHAR(500) | NOT NULL                       |
| **UNIQUE**     |              | **(candidate_id, social)**     |

> One row per platform per candidate; the UNIQUE constraint allows only one LinkedIn, one GitHub, one Twitter, etc. per candidate.

### candidate_preferences
| Column               | Type         | Notes                  |
|----------------------|--------------|------------------------|
| preference_id        | BIGSERIAL PK |                        |
| candidate_id         | BIGINT FK    | → external_candidate UNIQUE    |
| work_mode            | VARCHAR(30)  | Remote/Hybrid/Onsite   |
| desired_salary_min   | BIGINT       |                        |
| desired_salary_max   | BIGINT       |                        |
| preferred_locations  | JSONB        | array of strings       |
| notice_period_days   | INTEGER      |                        |
| willing_to_relocate  | BOOLEAN      | DEFAULT FALSE          |

### resumes
| Column            | Type         | Notes                           |
|-------------------|--------------|---------------------------------|
| resume_id         | BIGSERIAL PK |                                 |
| candidate_id      | BIGINT FK    | → external_candidate                  |
| object_key        | VARCHAR(500) | MinIO key                       |
| original_filename | VARCHAR(255) |                                 |
| is_active         | BOOLEAN      | DEFAULT TRUE (latest resume)    |
| version           | INTEGER      | DEFAULT 1                       |
| uploaded_at       | TIMESTAMP    |                                 |

---

## application_db

### applications ← KEY TABLE
| Column                  | Type           | Notes                              |
|-------------------------|----------------|------------------------------------|
| application_id          | BIGSERIAL PK   |                                    |
| candidate_email         | VARCHAR(150)   | NOT NULL — identity without auth   |
| candidate_id            | BIGINT         | nullable link to candidate_db      |
| job_id                  | BIGINT         | NOT NULL                           |
| job_title               | VARCHAR(300)   | snapshot at submission time        |
| resume_file_path        | VARCHAR(500)   | MinIO object key                   |
| resume_original_filename| VARCHAR(255)   |                                    |
| source                  | VARCHAR(50)    | DEFAULT 'PORTAL'                   |
| current_stage           | VARCHAR(50)    | APPLIED→SCREENING→INTERVIEW→OFFER  |
| ai_score                | INTEGER        | 0-100                              |
| ai_rationale            | TEXT           |                                    |
| free_notes              | TEXT           |                                    |
| stage_move_reason       | TEXT           |                                    |
| applied_at              | TIMESTAMP      | DEFAULT NOW()                      |
| screening_at            | TIMESTAMP      |                                    |
| technical_at            | TIMESTAMP      |                                    |
| interview_at            | TIMESTAMP      |                                    |
| final_round_at          | TIMESTAMP      |                                    |
| offer_at                | TIMESTAMP      |                                    |
| hired_at                | TIMESTAMP      |                                    |
| rejected_at             | TIMESTAMP      |                                    |
| rejection_reason        | VARCHAR(100)   |                                    |
| referral_code           | VARCHAR(50)    |                                    |
| last_updated_at         | TIMESTAMP      | DEFAULT NOW() updated on change    |
| blocked_from_reapply    | BOOLEAN        | DEFAULT FALSE                      |
| **UNIQUE**              |                | **(candidate_email, job_id)**      |

> **Business Rule**: One candidate (email) can apply to multiple jobs, but cannot apply to the same job twice. The UNIQUE constraint on `(candidate_email, job_id)` enforces this at the DB level. The service layer throws `AlreadyAppliedException` (HTTP 409) before hitting the DB.

### application_profile_snapshots
| Column                 | Type       | Notes                                    |
|------------------------|------------|------------------------------------------|
| snapshot_id            | BIGSERIAL  |                                          |
| application_id         | BIGINT FK  | → applications (1:1)                     |
| candidate_name         | VARCHAR    | Parsed from resume                       |
| email                  | VARCHAR    | Candidate email at submission time       |
| phone_number           | VARCHAR    |                                          |
| location               | VARCHAR    |                                          |
| total_experience_years | FLOAT      |                                          |
| current_ctc            | BIGINT     | Grid Dynamics question                   |
| expected_ctc           | BIGINT     | Grid Dynamics question                   |
| notice_period_days     | INTEGER    | Grid Dynamics question                   |
| legally_authorized     | BOOLEAN    | Grid Dynamics question                   |
| willing_to_relocate    | BOOLEAN    | Grid Dynamics question                   |
| additional_comments    | TEXT       | Grid Dynamics question                   |
| education_json         | JSONB      | education array snapshot                 |
| experience_json        | JSONB      | experience array snapshot                |
| skills_json            | JSONB      | skills array snapshot                    |
| social_links_json      | JSONB      | linkedin, github, portfolio              |

### application_status_history
| Column         | Type      | Notes                     |
|----------------|-----------|---------------------------|
| history_id     | BIGSERIAL |                           |
| application_id | BIGINT FK | → applications            |
| from_stage     | VARCHAR   | previous stage            |
| to_stage       | VARCHAR   | NOT NULL                  |
| moved_by       | VARCHAR   | system or HR user         |
| reason         | TEXT      |                           |
| moved_at       | TIMESTAMP |                           |


---

## market_presence_db

### job_postings
| Column           | Type           | Notes                                   |
|------------------|----------------|-----------------------------------------|
| id               | BIGSERIAL PK   |                                         |
| demand_id        | BIGINT         | → Team 1 Demands                        |
| role_title       | VARCHAR(255)   |                                         |
| slug             | VARCHAR(255)   | UNIQUE public URL slug                  |
| description      | TEXT           |                                         |
| skills_required  | TEXT           |                                         |
| responsibilities | TEXT           |                                         |
| benefits         | TEXT           |                                         |
| employment_type  | VARCHAR(50)    | FULL_TIME/PART_TIME/CONTRACT/INTERN     |
| experience_level | VARCHAR(50)    | ENTRY/MID/SENIOR/LEAD/PRINCIPAL         |
| experience_years | VARCHAR(50)    |                                         |
| work_mode        | VARCHAR(50)    | REMOTE/ONSITE/HYBRID                     |
| location_city    | VARCHAR(150)   |                                         |
| location_state   | VARCHAR(150)   |                                         |
| location_country | VARCHAR(150)   |                                         |
| department       | VARCHAR(150)   |                                         |
| job_category     | VARCHAR(150)   |                                         |
| salary_min       | NUMERIC(15,2)  |                                         |
| salary_max       | NUMERIC(15,2)  |                                         |
| currency         | VARCHAR(100)   |                                         |
| show_salary      | BOOLEAN        | DEFAULT FALSE                           |
| posting_status   | VARCHAR(50)    | DRAFT/PUBLISHED/CLOSED/ARCHIVED          |
| meta_title       | VARCHAR(255)   | SEO                                     |
| meta_description | VARCHAR(500)   | SEO                                     |
| published_at     | TIMESTAMPTZ    |                                         |
| closed_at        | TIMESTAMPTZ    |                                         |
| expires_at       | TIMESTAMPTZ    | auto-close time                         |
| created_by       | BIGINT         | → Team 1 Users                          |
| updated_by       | BIGINT         | → Team 1 Users                          |
| is_deleted       | BOOLEAN        | DEFAULT FALSE                           |
| created_at       | TIMESTAMP      | DEFAULT NOW()                           |
| updated_at       | TIMESTAMP      | DEFAULT NOW()                           |


## notification_db

### notifications
| Column          | Type           | Notes                                  |
|-----------------|----------------|----------------------------------------|
| notification_id | BIGSERIAL PK   |                                        |
| candidate_email | VARCHAR(150)   | NOT NULL — links to candidate by email |
| title           | VARCHAR(300)   | short heading                          |
| message         | TEXT           | full notification body                 |
| type            | VARCHAR(50)    | APPLICATION / GENERAL / SYSTEM         |
| reference_id    | VARCHAR(100)   | e.g. application_id                    |
| is_read         | BOOLEAN        | DEFAULT FALSE                          |
| created_at      | TIMESTAMP      | DEFAULT NOW()                          |
| updated_at      | TIMESTAMP      | DEFAULT NOW()                          |

---

## Application Flow — State Machine

```
Resume Upload
     ↓  (file stored in MinIO, AI parses → pre-fills form)
Personal Info  (pre-filled from resume parse)
     ↓
Education      (pre-filled from resume parse)
     ↓
Experience     (pre-filled from resume parse)
     ↓
Social Links   (pre-filled from resume parse)
     ↓
Grid Dynamics Questions  (CTC, notice, authorization, relocation)
     ↓
Review & Declaration  (candidate confirms all data, accepts declaration)
     ↓
Submit → POST /api/applications/apply
     ↓
[Duplicate check: candidate_email + job_id UNIQUE]
     ↓ (if new)
application saved  →  snapshot saved
     ↓
Confirmation email sent (notification-service)
     ↓
In-app notification created (notification_db)
     ↓
Success screen → navigate to /past-applications
```

## Application Stage Flow

```
APPLIED → SCREENING → INTERVIEW → TECHNICAL_INTERVIEW → OFFER
                                                      ↓
                                                  (REJECTED or WITHDRAWN at any stage)
```
