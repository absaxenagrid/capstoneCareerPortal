# Forge Careers Portal v2 — Implementation Guide

## What Changed

### 1. Navigation: Sidebar → Top Navbar
- `Layout.jsx` replaced sidebar with a horizontal top navbar
- Nav items: **Home | Jobs | Past Applications | Notifications | AI Assistant**
- Profile page removed entirely
- Notification badge shows unread count on bell icon (desktop dropdown + mobile link)

### 2. Application Flow: Resume-First (7 steps)
New step order per spec:
1. **Resume Upload** — drag & drop PDF/DOCX, uploads to MinIO, parses with AI → pre-fills all fields
2. **Personal Info** — Full Name, Email, Phone, Location (pre-filled)
3. **Education** — Degree, University, Graduation Year (pre-filled)
4. **Experience** — Companies, titles, dates (pre-filled)
5. **Social Links** — LinkedIn, GitHub, Portfolio, Other
6. **Grid Dynamics Questions** — Authorization, CTC, Notice Period, Location, Relocation
7. **Review & Declaration** — Confirm all info, accept declaration, submit

### 3. Duplicate Application Prevention
- Backend: UNIQUE constraint on `(candidate_email, job_id)` in `applications` table
- Service: throws `AlreadyAppliedException` → HTTP 409
- Frontend: shows "You have already applied for this job" modal on 409

### 4. In-App Notifications
- `useStore` now has `notifications[]`, `addNotification()`, `markRead()`, `markAllRead()`
- After successful submission, notification is added to store
- Bell icon in navbar shows unread badge count
- `/notifications` page lists all notifications with read/unread state
- Desktop dropdown shows latest 10 with "View all" link

### 5. Past Applications Page (`/past-applications`)
- Replaces `MyApplicationsPage`
- Columns: Job Title | Application ID | Applied Date | Status | Last Updated
- Search by title, company, status, or application ID
- Sortable columns (click header to sort asc/desc)
- Pagination support (pulls from backend)
- Stats row: Total | Applied | In Progress | Offers

### 6. AI Assistant (`/ai-assistant`)
- Replaces ChatPanel (user-to-user messaging removed)
- Full-page Claude-powered chatbot
- Context-aware: knows about Forge portal, application flow, job descriptions
- Suggested questions displayed on first load
- Supports multi-turn conversation

---

## Database Setup

### Step 1: PostgreSQL
```sql
-- Run backend/init-db.sql
CREATE DATABASE candidate_db;
CREATE DATABASE application_db;
CREATE DATABASE file_db;
CREATE DATABASE notification_db;
```

### Step 2: Flyway migrations run automatically
Each service runs its own migration on startup:
- `candidate-service` → `candidate_db` via `V1__create_candidate_schema.sql`
- `application-service` → `application_db` via `V1__create_application_schema.sql`
- `notification-service` → `notification_db` via `V1__create_notification_schema.sql`

### Step 3: Environment variables
```env
DB_HOST=localhost
DB_USER=postgres
DB_PASS=postgres
MAIL_HOST=smtp.gmail.com
MAIL_USER=noreply@forge.ai
MAIL_PASS=yourpassword
```

---

## Backend Changes Summary

### application-service
| File | Change |
|------|--------|
| `Application.java` | Added `candidateEmail`, `jobTitle`, `lastUpdatedAt`. Unique on `(candidate_email, job_id)` |
| `ApplicationProfileSnapshot.java` | Added `location`, `currentCtc`, `expectedCtc`, `legallyAuthorized`, `willingToRelocate`, `additionalComments`, `socialLinksJson` |
| `ApplyJobRequest.java` | Changed `candidateId` (required) → `candidateEmail` (required) + nested `SnapshotRequest` |
| `ApplicationController.java` | Added `GET /candidate?email=` endpoint, removed candidateId path param |
| `ApplicationService.java` | Duplicate check by email+jobId, builds snapshot from request payload (no more Feign client calls) |
| `ApplicationRepository.java` | Added `findByCandidateEmailOrderByAppliedAtDesc`, `existsByCandidateEmailAndJobId` |
| `ApplicationResponse.java` | Added `candidateEmail`, `lastUpdatedAt` |
| `V1__create_application_schema.sql` | Rewritten: email-based unique key, new snapshot columns |

### notification-service (NEW)
| File | Description |
|------|-------------|
| `V1__create_notification_schema.sql` | notifications table with email, message, type, is_read |
| `application.yml` | Port 8087, connects to notification_db, mail config |

---

## Frontend Changes Summary

| File | Change |
|------|--------|
| `App.jsx` | Routes: added `/past-applications`, `/notifications`, `/ai-assistant`; removed `/profile` |
| `Layout.jsx` | Full rewrite: top navbar with 5 nav items, notification dropdown, dark mode |
| `store/index.js` | Added notifications state + actions; removed auth; added `candidateEmail` |
| `services/api.js` | Added `resumeParseApi`, `notificationApi`; updated `applicationApi.getCandidateApplications` to email-based |
| `ApplicationFormPage.jsx` | Full rewrite: resume-first 7-step flow |
| `PastApplicationsPage.jsx` | New: search + sort + pagination; replaces MyApplicationsPage |
| `NotificationsPage.jsx` | New: lists all notifications, mark read |
| `AIAssistantPage.jsx` | New: Claude-powered chatbot |
| `ProfilePage.jsx` | **DELETED** |
| `MyApplicationsPage.jsx` | **DELETED** (replaced by PastApplicationsPage) |
| `ChatPanel.jsx` | **DELETED** (replaced by AIAssistantPage) |

---

## Docker Compose
The root `docker-compose.yml` needs to add the `notification-service`.
Add this service block:
```yaml
  notification-service:
    build: ./backend/notification-service
    ports:
      - "8087:8087"
    environment:
      DB_HOST: postgres
      DB_USER: postgres
      DB_PASS: postgres
      MAIL_HOST: smtp.gmail.com
      MAIL_USER: ${MAIL_USER}
      MAIL_PASS: ${MAIL_PASS}
      EUREKA_HOST: eureka-server
    depends_on:
      - postgres
      - eureka-server
```
