
## লক্ষ্য
Dashboard → Settings-এর ভেতরে একটি নতুন ট্যাব "ইমেইল টেমপ্লেট" যোগ করা, যেখান থেকে super_admin সকল অটোমেটিক ইমেইল টেমপ্লেট (subject + body) দেখতে, লাইভ preview করতে ও এডিট করতে পারবেন — কোড ডিপ্লয় ছাড়াই।

## কোন কোন ইমেইল কাভার হবে
বর্তমানে `server/services/emailTemplate.js`-এ hard-coded ৬টি টেমপ্লেট আছে:
1. `admin_created` — নতুন অ্যাডমিন অ্যাকাউন্ট
2. `password_changed` — সুপার অ্যাডমিন কর্তৃক পাসওয়ার্ড রিসেট
3. `forgot_password` — পাসওয়ার্ড রিসেট লিংক
4. `login_otp` — লগইন OTP
5. `contact_reply` / broadcast — অ্যাডমিন-লেখা content wrapper
6. `donation_receipt` — SSLCommerz সফল দানের রসিদ

প্রত্যেকটির জন্য এডিটেবল ফিল্ড:
- **Subject** (ইমেইলের বিষয়)
- **Title** (কার্ডের বড় হেডিং)
- **Preheader** (ইনবক্স প্রিভিউ)
- **Intro / Body** (rich text — bold, link, paragraph)
- **CTA label** (যেখানে প্রযোজ্য)
- **Note / Footer note** (যেখানে প্রযোজ্য)

Variable placeholders থাকবে যেমন `{{name}}`, `{{email}}`, `{{amount}}`, `{{tran_id}}`, `{{reset_url}}`, `{{code}}` — এডিটরের উপরে available variable-এর তালিকা দেখানো হবে।

## Backend পরিবর্তন

**নতুন migration** `021_email_templates.sql`:
```
CREATE TABLE email_templates (
  key VARCHAR(64) PRIMARY KEY,
  subject VARCHAR(255) NOT NULL,
  title VARCHAR(255),
  preheader VARCHAR(255),
  intro LONGTEXT,
  cta_label VARCHAR(120),
  note LONGTEXT,
  footer_note LONGTEXT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```
প্রথম রান-এ ৬টি টেমপ্লেটের বর্তমান default value seed হবে।

**নতুন route** `server/routes/emailTemplates.js`:
- `GET /email-templates` — সকল টেমপ্লেট (super_admin only)
- `GET /email-templates/:key` — একটি টেমপ্লেট
- `PUT /email-templates/:key` — এডিট (super_admin only)
- `POST /email-templates/:key/preview` — sample data দিয়ে HTML render করে ফেরত দেয়
- `POST /email-templates/:key/reset` — default-এ ফেরত

**`emailTemplate.js` রিফ্যাক্টর**:
- প্রতিটি `tpl*` ফাংশন আগে DB থেকে override খুঁজবে; না পেলে বর্তমান hard-coded default ব্যবহার করবে।
- একটি ছোট placeholder resolver: `{{name}}` → actual value replace।

## Frontend পরিবর্তন

**`src/pages/dashboard/Settings.tsx`**-এ নতুন ট্যাব "ইমেইল টেমপ্লেট" — শুধু super_admin-এর কাছে দৃশ্যমান।

নতুন কম্পোনেন্ট `src/components/dashboard/EmailTemplateEditor.tsx`:
- বাম দিকে ৬টি টেমপ্লেটের তালিকা
- ডান দিকে ফর্ম: subject, title, preheader, intro (textarea), cta label, note
- উপরে "উপলব্ধ ভ্যারিয়েবল" chip-এ ক্লিক করলে cursor-এ insert
- নিচে দুটি বাটন: **সংরক্ষণ করুন** ও **প্রিভিউ দেখুন** (মডালে iframe-এ live rendered HTML)
- ডানে একটি **ডিফল্টে ফেরত** বাটন

## নিরাপত্তা
- সকল endpoint `requireSuperAdmin`
- HTML sanitization: শুধু নির্দিষ্ট ট্যাগ (`b, i, a, p, br, ul, li`) allow; `<script>`, `<style>`, `onerror` ইত্যাদি strip

## Layout
```text
Settings
 ├─ সাইট (existing)
 ├─ পেমেন্ট (existing)
 ├─ হেডার ইমেজ (existing)
 └─ ইমেইল টেমপ্লেট  ← নতুন
     ├─ [তালিকা] ────┬── Subject, Title, Preheader
     │  • Admin created│   Intro (rich)
     │  • Password reset│   CTA label, Note
     │  • Forgot password│  [Variables: {{name}} {{email}} ...]
     │  • Login OTP    │   [সংরক্ষণ] [প্রিভিউ] [ডিফল্ট]
     │  • Contact reply│
     │  • Donation receipt
```

## Rollout ধাপ
1. Migration + route + refactor `emailTemplate.js`
2. `Settings.tsx`-এ নতুন ট্যাব ও `EmailTemplateEditor` কম্পোনেন্ট
3. cPanel-এ deploy → migration auto-run → default seed → dashboard থেকে এডিট শুরু

আপনি চাইলে এখনই বাস্তবায়ন শুরু করব।
