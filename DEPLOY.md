# Unite Foundation — Full cPanel Deployment Guide

এই গাইড follow করলে ১০–১৫ মিনিটে **frontend + backend** সব setup হয়ে যাবে ইনশাআল্লাহ।

---

## 📋 Overview

- **Frontend** (React) → `/public_html/` → `https://unitefoundation.bd`
- **Backend** (Express + MySQL) → `/public_html/api-app/` → `https://api.unitefoundation.bd`
- **Deploy** → GitHub Actions থেকে manual run করলে frontend/backend upload হবে

---

## ধাপ ১ — cPanel-এ MySQL Setup ✅ (আপনি করেছেন)

- Database: `unitefdn_main`
- User: `unitefdn_admin`
- **User-কে database-এ ALL PRIVILEGES দিতে ভুলবেন না** (cPanel → MySQL Databases → "Add User to Database")
- **MySQL password টি সংরক্ষণ করুন** — পরে backend `.env`-এ লাগবে

---

## ধাপ ২ — Subdomain তৈরি করুন

cPanel → **Domains** → **Create A New Domain**:

- Domain: `api.unitefoundation.bd`
- **Uncheck** "Share document root with `unitefoundation.bd`"
- Document Root: `/home/unitefdn/public_html/api-public` (auto-fill হবে, রেখে দিন)
- Create

> এই folder-টা placeholder — আসল Node app আলাদা folder-এ থাকবে, নিচে দেখুন।

---

## ধাপ ৩ — Node.js App তৈরি করুন

cPanel → **Setup Node.js App** → **Create Application**:

| Field | Value |
|---|---|
| Node.js version | `20.x` (latest LTS) |
| Application mode | `Production` |
| Application root | `public_html/api-app` |
| Application URL | `api.unitefoundation.bd` |
| Application startup file | `app.js` |
| Passenger log file | (default রাখুন) |

**Create** ক্লিক করুন। এখন যে virtualenv path দেখাবে (যেমন `source /home/unitefdn/nodevenv/public_html/api-app/20/bin/activate`) সেটা copy করে রাখুন।

---

## ধাপ ৪ — Environment Variables set করুন

একই page-এ scroll করলে **Environment Variables** section আসবে। নিচেরগুলো add করুন (Add Variable → Save):

```
NODE_ENV=production
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_NAME=unitefdn_main
DB_USER=unitefdn_admin
DB_PASSWORD=<আপনার MySQL password>
JWT_SECRET=<একটি ৬৪+ character random string — নিচে generate করার উপায় আছে>
JWT_EXPIRES_IN=24h
CORS_ORIGINS=https://unitefoundation.bd,https://www.unitefoundation.bd
SMTP_HOST=mail.unitefoundation.bd
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=no-reply@unitefoundation.bd
SMTP_PASS=<SMTP password — cPanel Email Accounts-এ set করা>
SMTP_FROM=Unite Foundation <no-reply@unitefoundation.bd>
FRONTEND_URL=https://unitefoundation.bd
UPLOAD_DIR=./uploads
MAX_UPLOAD_MB=10
```

**JWT_SECRET generate করার সহজ উপায়:** Terminal / online tool-এ:
```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

**Save** করুন।

---

## ধাপ ৫ — GitHub Secrets add করুন

GitHub repo → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**:

| Name | Value |
|---|---|
| `FTP_PASSWORD` | cPanel FTP password (deploy@unitefoundation.bd account-এর) |
| `VITE_API_BASE_URL` | `https://api.unitefoundation.bd` |

---

## ধাপ ৬ — Deployment run করুন

Code GitHub-এ push করার পর **Actions → Deploy to cPanel → Run workflow** ক্লিক করুন। Target ও method নির্বাচন করে run দিন।

- **frontend** job → `/public_html/`-এ dist upload
- **backend** job → `/public_html/api-app/`-এ server code upload

---

## ধাপ ৭ — Backend dependencies install করুন (একবার)

cPanel → Node.js App → আপনার app-এর পাশে **Run NPM Install** button ক্লিক করুন।

অথবা cPanel **Terminal** (available থাকলে):
```bash
source /home/unitefdn/nodevenv/public_html/api-app/20/bin/activate
cd ~/public_html/api-app
npm install --production
```

---

## ধাপ ৮ — Database schema import করুন (একবার)

cPanel → **phpMyAdmin** → `unitefdn_main` select → **Import** tab:
- File: `server/db/schema.sql` (repo থেকে download করে upload করুন)
- **Go** — সব table তৈরি হয়ে যাবে

---

## ধাপ ৯ — প্রথম admin user তৈরি করুন

phpMyAdmin → `unitefdn_main` → `users` table → **Insert**:

```sql
-- password hash generate: Node-এ bcrypt দিয়ে, অথবা online bcrypt generator (12 rounds)
-- উদাহরণ: password "ChangeMe123!" এর bcrypt hash:
INSERT INTO users (id, name, email, password_hash, role)
VALUES (
  UUID(),
  'Admin',
  'admin@unitefoundation.bd',
  '$2a$12$abcdefghijklmnopqrstuvREPLACEWITHREALHASH',
  'admin'
);
```

**Password hash generate করার সহজ উপায়:**
```bash
node -e "console.log(require('bcryptjs').hashSync('ChangeMe123!', 12))"
```

---

## ধাপ ১০ — App Restart করুন

cPanel → Node.js App → **Restart** button। কয়েক সেকেন্ড পরে test করুন:

```
https://api.unitefoundation.bd/health
```

এটা `{ "ok": true }` return করলে সব ready!

---

## 🔒 Security Notes

- FTP password **শুধু GitHub Secret-এ**, কোথাও লিখবেন না
- MySQL password **শুধু cPanel env var-এ**, GitHub-এ নয়
- JWT_SECRET একবার set করলে **পরিবর্তন করবেন না** (নাহলে সব session invalidate হবে)
- SMTP password **cPanel Email Accounts-এ set করা**, backend শুধু ব্যবহার করে

---

## 🐛 Troubleshooting

**Frontend blank দেখাচ্ছে?**
- Browser console চেক করুন। সাধারণত `.htaccess` missing হলে হয়
- `public/.htaccess` file `/public_html/`-এ আছে কিনা FTP-তে verify করুন

**API 502 / down?**
- cPanel Node.js App → **Restart** ক্লিক করুন
- Application → **Logs** দেখুন

**CORS error?**
- `CORS_ORIGINS` env var-এ frontend domain আছে কিনা চেক করুন
- App restart করুন env change-এর পর

**Database error?**
- MySQL user-কে database-এ ALL PRIVILEGES দিয়েছেন কিনা confirm করুন
- `DB_HOST=localhost` (cPanel-এ সবসময় localhost)

---

## 🔎 Backend deployment tracker

প্রতিটি backend run শেষে GitHub Actions-এর **Summary** page-এ একটি tracker report দেখা যাবে। ব্যর্থ হলেও `backend-deploy-tracker` artifact download করলে প্রতিটি health-check attempt-এর raw evidence পাওয়া যাবে।

Tracker একসাথে মিলিয়ে দেখে:

- GitHub-এর expected commit SHA
- FTP-তে verify হওয়া `BACKEND_REMOTE_PATH`
- live Passenger `Application Root`
- live `DEPLOY_RELEASE`
- `tmp/restart.txt` mtime
- worker start time ও uptime

Common result code:

- `APPLICATION_ROOT_MISMATCH` — cPanel Application Root এবং `BACKEND_REMOTE_PATH` আলাদা
- `PASSENGER_NOT_RECYCLED` — marker নতুন হলেও Passenger worker restart হয়নি
- `RELEASE_FILE_MISSING_IN_APP_ROOT` — upload সফল, কিন্তু running root-এ release marker নেই
- `STALE_DIAGNOSTIC_CODE` — live worker এখনও পুরোনো code চালাচ্ছে; cPanel থেকে একবার restart করে Application Root মিলাতে হবে
- `LIVE` — upload এবং running commit একই

> গুরুত্বপূর্ণ: deploy step সবুজ কিন্তু tracker-এ commit না মিললে deployment সফল নয়। Workflow এখন এই অবস্থায় failure দেবে এবং evidence artifact রেখে দেবে।

## 🚀 Future Deploys

এখন থেকে update deploy করতে GitHub Actions-এর **Run workflow** ব্যবহার করুন। একই সময়ে দ্বিতীয় deploy দিলে সেটি queue-তে অপেক্ষা করবে, ফলে দুই release-এর file মিশবে না।

কোনো ধাপে আটকে গেলে screenshot পাঠান — সাহায্য করবো ইনশাআল্লাহ।
