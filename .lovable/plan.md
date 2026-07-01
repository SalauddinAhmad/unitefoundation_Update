# Unite Foundation — Full-Stack Production Deployment Plan

## 🎯 লক্ষ্য
Frontend (React) + Backend (Express + MySQL) — দুটোই cPanel-এ automatic deploy, secure এবং professional।

## 🏗️ Architecture

```text
┌────────────────────────────────────────────────────────┐
│         GitHub Repository (main branch)                │
│  ┌──────────────┐          ┌──────────────────┐        │
│  │  /  (React)  │          │  /server (API)   │        │
│  └──────┬───────┘          └────────┬─────────┘        │
└─────────┼───────────────────────────┼──────────────────┘
          │ push → GitHub Actions     │
          ▼                           ▼
    ┌─────────────┐          ┌──────────────────┐
    │ Build Vite  │          │  Zip /server     │
    │  → dist/    │          │  → FTP upload    │
    └─────┬───────┘          └────────┬─────────┘
          │ FTP                       │ FTP
          ▼                           ▼
  /public_html/               /home/unitefdn/api/
  (unitefoundation.bd)        (Node.js App via cPanel)
                                       │
                                       ▼
                              MySQL: unitefdn_main
                                       │
                                       ▼
                         https://api.unitefoundation.bd
```

## 📦 কী কী তৈরি হবে

### ১. Backend (`server/` directory in repo)
- **Express + MySQL2** — production-grade REST API
- **Security**: helmet, cors (whitelist), rate-limit, bcrypt, JWT
- **Auth**: login, forgot/reset password, 2FA OTP (nodemailer)
- **Routes**: donations, applications, projects, posts, gallery, messages, settings, team, admin/users, stats
- **DB**: migration file (`server/db/schema.sql`) — সব tables + seeds
- **Env**: `server/.env.example` — DB, JWT, SMTP, CORS origins
- **Entry**: `server/app.js` (cPanel Node.js App Manager compatible)
- **Logger**: winston with daily rotation
- **Validation**: zod schemas per route

### ২. Deployment Workflow
- `.github/workflows/deploy.yml` update:
  - Job 1: Build frontend → FTP to `/public_html/`
  - Job 2: Package backend → FTP to `/api/` (outside public_html)
  - Trigger cPanel Node.js restart via touch file (`restart.txt`)
- `.htaccess`-এ SPA fallback + security headers

### ৩. Documentation (`DEPLOY.md`)
আপনার জন্য step-by-step গাইড:
1. cPanel-এ subdomain `api.unitefoundation.bd` তৈরি
2. Node.js App Manager-এ app registration (Application root: `/api`, startup file: `app.js`, Node 20)
3. MySQL Database Wizard-এ user `unitefdn_admin` → `unitefdn_main`-এ ALL PRIVILEGES
4. phpMyAdmin-এ `schema.sql` import
5. cPanel Node.js App → Environment variables set
6. GitHub Secrets (5টা) add — নীচে

## 🔐 GitHub Secrets (যা add করতে হবে)

| নাম | কী |
|---|---|
| `FTP_PASSWORD` | cPanel FTP password |
| `VITE_API_BASE_URL` | `https://api.unitefoundation.bd` |
| `BACKEND_ENV` | Backend `.env` content (একবারে) |

## 🔒 Security Checklist
- Password hash: bcrypt (12 rounds)
- JWT: 24h expiry, HS256, strong secret (auto-generate)
- Rate limit: 100 req / 15 min per IP, login: 5 / 15 min
- CORS: only `https://unitefoundation.bd`
- SQL: prepared statements everywhere (mysql2)
- Secrets: never committed — cPanel env + GitHub Secrets only
- HTTPS enforced via `.htaccess`
- Helmet CSP headers

## 📁 File Structure (তৈরি হবে)

```text
server/
├── app.js                  # cPanel entry point
├── package.json
├── .env.example
├── db/
│   ├── pool.js             # mysql2 connection pool
│   └── schema.sql          # tables + seeds
├── middleware/
│   ├── auth.js             # JWT verify
│   ├── rateLimit.js
│   └── errorHandler.js
├── routes/
│   ├── auth.js
│   ├── donations.js
│   ├── applications.js
│   ├── projects.js
│   ├── posts.js
│   ├── gallery.js
│   ├── messages.js
│   ├── settings.js
│   ├── team.js
│   ├── admin.js
│   └── stats.js
├── services/
│   └── mailer.js           # nodemailer SMTP
└── utils/
    ├── validate.js         # zod schemas
    └── logger.js

.github/workflows/deploy.yml (updated — 2 jobs)
DEPLOY.md                   # আপনার জন্য cPanel setup guide
```

## ⏭️ পরবর্তী ধাপ (approve করলে)

1. আমি **সব backend code + workflow + docs** তৈরি করবো (এই session-এ)
2. তারপর দুটো জিনিস চাইবো secure form-এ:
   - **`FTP_PASSWORD`** (cPanel FTP password)
   - **MySQL password** (backend `.env`-এর জন্য) — cPanel-এ set করবেন
3. আপনি **DEPLOY.md** follow করে cPanel-এ ১০-১৫ মিনিটে setup শেষ করবেন
4. GitHub-এ push → automatic deploy শুরু ইনশাআল্লাহ

**Plan-টি approve করলেই কাজ শুরু করছি।**
