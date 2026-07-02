
# সব কিছু Dynamic করার Plan (৫টি Module)

## লক্ষ্য
পাবলিক পেজে যা দেখা যায় — সব DB থেকে load হবে; dashboard থেকে CRUD; static demo data সরানো হবে। **UI/ডিজাইন অপরিবর্তিত থাকবে** — শুধু data source পাল্টাবে।

---

## Module 1: Projects (Public → Dynamic)
- ✅ Backend/dashboard/DB আগে থেকেই আছে
- 🔨 `src/pages/Projects.tsx` — `GET /projects` fetch, category filter DB data থেকে
- 🔨 `src/pages/ProjectDetail.tsx` — `GET /projects/:slug` fetch
- 🔨 `src/data/projects.ts` — শুধু helper (`formatBDT`, `toBnNum`) রাখব, `projects` array remove
- 🔨 `ProjectCard.tsx` — API shape এর সাথে সঙ্গতিপূর্ণ (cover_image_url ইত্যাদি)
- ⚠️ Field mapping: existing DB tag `raised/budget/beneficiaries` ↔ UI `raised/target/donors` — schema এ minor addition (`donors`, `location`, `urgent`, `gallery` JSON)

## Module 2: Blog (Public → Dynamic)
- ✅ Backend/dashboard CRUD আছে
- 🔨 `src/pages/Blog.tsx` — `GET /posts?status=published` fetch
- 🔨 `src/pages/BlogPost.tsx` — `GET /posts/:slug`; `content` column এ JSON stringified `ContentBlock[]` store; parse করে render
- 🔨 Dashboard Blog editor — rich ContentBlock builder সহ (heading/paragraph/image/quote/list/stats/callout/cta)
- 🔨 `src/data/blog.ts` — শুধু `ContentBlock` type export

## Module 3: Gallery (Public → Dynamic)
- ✅ Backend আছে
- 🔨 `src/pages/Gallery.tsx` — `GET /gallery` fetch (albums + items)
- 🔨 `src/components/home/GallerySection.tsx` — DB items দেখাবে
- 🔨 Video support — `kind='video'` items এ YouTube URL

## Module 4: Partners (নতুন — Full stack)
- 🆕 DB table `partners` (name, slug, logo_url, cover_url, tagline, description, website, category, sort_order)
- 🆕 `server/routes/partners.js` — GET/POST/PATCH/DELETE
- 🆕 `src/pages/dashboard/Partners.tsx` — CRUD UI
- 🔨 `src/pages/PartnerDetail.tsx` — DB থেকে fetch
- 🔨 `src/components/home/PartnersSection.tsx` — DB থেকে load
- 🔨 `src/data/partners.ts` — remove (or type-only)

## Module 5: Impact Stats (নতুন — DB-editable)
- 🆕 settings JSON এ `impact_stats` field (array of `{label, value, icon}`)
- 🔨 Settings page এ editor
- 🔨 `src/components/home/ImpactStats.tsx` — settings থেকে load
- 🔨 `src/data/impact.ts` — remove

---

## Backend পরিবর্তনসমূহ (Schema)

`server/db/schema.sql` এ **CREATE TABLE IF NOT EXISTS** + **ALTER TABLE** যোগ করব। User দুইভাবে apply করতে পারবেন:

**Option A (আপনার জন্য সহজ):** নতুন SQL statements আমি আলাদা file `server/db/migrations/002_dynamic_modules.sql` এ দেব — phpMyAdmin এ import করলেই হবে। কোনো data হারাবে না।

New tables/columns:
```sql
CREATE TABLE partners (id, name, slug, logo_url, cover_url, tagline, description, website, category, sort_order, created_at);
ALTER TABLE projects ADD COLUMN donors INT DEFAULT 0, ADD COLUMN location VARCHAR(150), 
  ADD COLUMN urgent TINYINT(1) DEFAULT 0, ADD COLUMN gallery JSON, ADD COLUMN target DECIMAL(14,2);
-- posts.content ইতিমধ্যে LONGTEXT — JSON store করবে, no change
```

---

## নতুন API Endpoints
- `GET /partners`, `GET /partners/:slug`, `POST/PATCH/DELETE /partners/:id`
- `GET /settings` (public — impact_stats দিতে)

---

## Files Affected (আনুমানিক)
- **Backend (add/edit):** 3 route files + 1 SQL migration + `app.js`
- **Frontend (edit):** 8 public pages/components + 5 dashboard pages
- **Frontend (new):** 1 dashboard page (Partners) + rich blog editor components

---

## Execution Order (5 ধাপে, প্রতি ধাপে test)
1. **Backend**: SQL migration + partners route + settings expansion → deploy
2. **Projects public**: API fetch conversion + card mapping
3. **Gallery public + home**: API fetch conversion
4. **Partners**: Dashboard CRUD + public pages fetch
5. **Blog + Impact Stats**: Rich editor + settings-driven stats

প্রতি ধাপ শেষে আপনি preview এ check করবেন — কোথাও ভুল হলে সেখানেই fix করে পরবর্তী step এ যাব।

---

## ঝুঁকি ও Safety
- ✅ কোনো existing data delete হবে না (শুধু `ADD COLUMN` / new tables)
- ✅ Migration fail হলেও পুরনো site কাজ করবে
- ✅ প্রথম deploy এর পর যদি DB empty থাকে (partners/projects), আমি seed data script দিব যাতে current static data DB তে চলে যায়

---

## Deploy সংখ্যা
- **1 বার backend deploy** (SQL migration + new routes)
- **1 বার frontend deploy** সব হয়ে গেলে (আপনি চাইলে ধাপে ধাপেও দিতে পারেন)

---

**Approve করলে Module 1 (Backend SQL + partners route + settings expansion) দিয়ে শুরু করব। প্রথমে backend, তারপর frontend — কারণ frontend আগে deploy করলে API missing হয়ে সাইট break হতে পারে।**
