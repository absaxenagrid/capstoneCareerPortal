# ⚡ Forge Careers Portal

A full-stack recruitment platform built with **React 18** and **Spring Boot microservices** — enabling candidates to discover jobs, upload resumes, and track applications end-to-end.

---

## ✨ Features

- **Resume-first application flow** — upload a PDF/DOCX and watch fields auto-fill via Apache Tika parsing
- **7-step guided application** — Personal Info → Education → Experience → Links → Screening Questions → Review
- **Duplicate prevention** — one application per candidate email per job
- **Confirmation emails** — professional HTML emails sent on submission
- **In-app notifications** — real-time notification centre with unread badge
- **Past Applications** — searchable, sortable history with pagination
- **AI Assistant** — Claude-powered chatbot for candidate queries
- **Dark mode** — full light/dark theme support
- **Service discovery** — Eureka-based load balancing across all microservices

---

## 🚀 Quick Start

```bash
docker-compose up --build
```

Open **http://localhost:3000**

> **First run:** ~3–5 minutes (Maven downloads dependencies, Docker builds images)
> **Subsequent runs:** ~30–60 seconds (images cached)

Or use the convenience script:

```bash
chmod +x start.sh

./start.sh              # build and start everything
./start.sh --no-build   # start without rebuilding images
./start.sh --stop       # stop all containers
./start.sh --clean      # stop and wipe all volumes (fresh slate)
```

---

## 🌐 Service URLs

| Service | URL | Notes |
|---|---|---|
| **Frontend** | http://localhost:3000 | React + Nginx |
| **API Gateway** | http://localhost:8080 | Spring Cloud Gateway |
| **Candidate Service** | http://localhost:8081/swagger-ui.html | Profiles, resumes, skills |
| **Application Service** | http://localhost:8082/swagger-ui.html | Job applications |
| **File Service** | http://localhost:8083/swagger-ui.html | Resume uploads → MinIO |
| **Notification Service** | http://localhost:8087/swagger-ui.html | Email + in-app alerts |
| **Eureka Dashboard** | http://localhost:8761 | Service registry |
| **MinIO Console** | http://localhost:9001 | Object storage UI |
| **PostgreSQL** | localhost:5433 | Credentials: `forge / forge123` |

**MinIO login:** `minioadmin` / `minioadmin123`

---

## 🏗️ Architecture

```
Browser (port 3000)
       │
       ▼
  Nginx (frontend)
       │  /api/* →
       ▼
  API Gateway  :8080
       │
       ├──▶  /api/candidates/**   →  Candidate Service   :8081  ──▶  candidate_db
       ├──▶  /api/resumes/**      →  Candidate Service   :8081
       ├──▶  /api/education/**    →  Candidate Service   :8081
       ├──▶  /api/skills/**       →  Candidate Service   :8081
       ├──▶  /api/applications/** →  Application Service :8082  ──▶  application_db
       ├──▶  /api/files/**        →  File Service        :8083  ──▶  MinIO
       └──▶  /api/notifications/**→  Notification Service:8087  ──▶  notification_db
                                                                 ──▶  SMTP (email)

All services register with Eureka :8761 for service discovery.
API Gateway uses Eureka load-balancer (lb://) routing with retry + backoff.
```

---

## 🗄️ Databases

Three isolated PostgreSQL databases, each managed by **Flyway** migrations:

| Database | Service | Key Tables |
|---|---|---|
| `candidate_db` | Candidate Service | `candidates`, `resumes`, `education_details`, `experience_details`, `candidate_skills` |
| `application_db` | Application Service | `applications`, `application_profile_snapshots` |
| `notification_db` | Notification Service | `notifications` |

---

## 📧 Email Configuration

Confirmation emails are sent from `absaxena@griddynamics.com` via Gmail SMTP.

1. Create a `.env` file from the template:

   ```bash
   cp .env.example .env
   ```

2. Fill in your Gmail App Password (not your regular password):

   ```env
   MAIL_USER=absaxena@griddynamics.com
   MAIL_PASS=xxxx xxxx xxxx xxxx
   ```

   > Generate an App Password at **Google Account → Security → App Passwords**.
   > Requires 2-Step Verification to be enabled.

3. Start with env file loaded:

   ```bash
   docker-compose --env-file .env up --build
   ```

---

## 🛠️ Tech Stack

### Frontend
| | |
|---|---|
| Framework | React 18 + Vite |
| Styling | Tailwind CSS |
| State | Zustand |
| Data fetching | React Query (TanStack) |
| Routing | React Router v6 |
| UI feedback | react-hot-toast |

### Backend
| | |
|---|---|
| Language | Java 17 |
| Framework | Spring Boot 3.2 |
| Service mesh | Spring Cloud 2023 (Eureka, Gateway) |
| Database ORM | Spring Data JPA + Hibernate |
| Migrations | Flyway |
| Resume parsing | Apache Tika |
| File storage | MinIO (S3-compatible) |
| Build | Maven |

### Infrastructure
| | |
|---|---|
| Containers | Docker + Docker Compose |
| Database | PostgreSQL 15 |
| Object storage | MinIO |
| Reverse proxy | Nginx |

---

## 💻 Local Development (without Docker)

Hot-reload mode for faster iteration:

**Terminal 1 — Infrastructure only:**
```bash
docker-compose up -d postgres minio
```

**Terminals 2–7 — One per service:**
```bash
cd backend/eureka-server        && mvn spring-boot:run
cd backend/api-gateway          && mvn spring-boot:run
cd backend/candidate-service    && mvn spring-boot:run
cd backend/application-service  && mvn spring-boot:run
cd backend/file-service         && mvn spring-boot:run
cd backend/notification-service && mvn spring-boot:run
```

**Terminal 8 — Frontend with hot reload:**
```bash
cd frontend && npm install && npm run dev
# Opens http://localhost:5173
```

---

## 📋 Useful Commands

```bash
# View logs for all services
docker-compose logs -f

# View logs for a specific service
docker-compose logs -f application-service
docker-compose logs -f frontend

# Rebuild and restart a single service after code change
docker-compose up --build candidate-service

# Stop everything (keep data)
docker-compose down

# Stop and wipe all data (completely fresh start)
docker-compose down -v
```

---

## 🧪 Seed Data

Create a test candidate manually:

```bash
curl -X POST http://localhost:8080/api/candidates \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Alex",
    "lastName": "Sterling",
    "email": "alex@forge.dev",
    "phoneNumber": "+1234567890"
  }'
```

---

## 📁 Project Structure

```
forge-updated/
├── frontend/                  # React 18 + Vite app
│   ├── src/
│   │   ├── pages/             # Route-level page components
│   │   ├── components/        # Shared UI components
│   │   ├── services/api.js    # Axios API client
│   │   └── store/index.js     # Zustand global state
│   └── nginx.conf             # Production Nginx config
│
├── backend/
│   ├── eureka-server/         # Service registry (port 8761)
│   ├── api-gateway/           # Routing + retry (port 8080)
│   ├── candidate-service/     # Profiles, resumes (port 8081)
│   ├── application-service/   # Job applications (port 8082)
│   ├── file-service/          # MinIO uploads (port 8083)
│   └── notification-service/  # Email + alerts (port 8087)
│
├── docker-compose.yml
├── .env.example               # Environment variable template
└── start.sh                   # Convenience startup script
```

---

## ⚙️ Environment Variables

| Variable | Default | Description |
|---|---|---|
| `MAIL_HOST` | `smtp.gmail.com` | SMTP server hostname |
| `MAIL_PORT` | `587` | SMTP port (STARTTLS) |
| `MAIL_USER` | `absaxena@griddynamics.com` | Sender email address |
| `MAIL_PASS` | *(required)* | Gmail App Password |
| `MINIO_ENDPOINT` | `http://minio:9000` | MinIO server URL |
| `MINIO_ACCESS_KEY` | `minioadmin` | MinIO access key |
| `MINIO_SECRET_KEY` | `minioadmin123` | MinIO secret key |
| `MINIO_BUCKET` | `candidate-resumes` | Resume storage bucket |

---

## 🐛 Troubleshooting

**Services show 503 on first startup**
Gateway routes via Eureka — all services need ~15–30 seconds to register after startup. The gateway has a built-in retry with exponential backoff; just wait a moment and try again.

**Flyway checksum mismatch on restart**
This happens when a migration file was changed after it was applied. Run:
```bash
docker-compose down -v   # wipes the database volume
docker-compose up --build
```

**Email not sending**
Check that `MAIL_PASS` is set to a Gmail **App Password** (16 characters), not your account password. View notification service logs:
```bash
docker-compose logs -f notification-service
```

**Resume parsing returns empty fields**
The backend uses Apache Tika. Ensure the candidate-service container is healthy:
```bash
docker-compose logs -f candidate-service
```

---

## 📄 License

MIT — free to use, modify, and distribute.# capstoneCareerPortal
