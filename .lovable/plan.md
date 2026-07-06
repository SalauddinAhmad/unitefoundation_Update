## লক্ষ্য

WordPress-এর মতো একটি **Media Library** সিস্টেম যোগ করা — যেখানে ইমেজ আপলোড অপশনে ক্লিক করলে আগে থেকে আপলোড করা সব ইমেজ দেখা যাবে, সেগুলো থেকে সিলেক্ট বা ডিলিট করা যাবে, এবং নতুন ইমেজ আপলোডও করা যাবে। এটি ড্যাশবোর্ডের **সব ইমেজ আপলোড অপশনে** কাজ করবে।

## ব্যাকএন্ড (Node/Express + MySQL)

**নতুন টেবিল** `media_library`:
- `id CHAR(36) PRIMARY KEY`
- `url LONGTEXT` — base64 data URI
- `filename VARCHAR(255)`, `mime VARCHAR(60)`, `size_bytes INT`
- `width INT`, `height INT`
- `uploaded_by CHAR(36)` (users.id, nullable)
- `created_at DATETIME`

**নতুন রাউট** `server/routes/media.js`:
- `GET /media` — সব ইমেজ লিস্ট (page, search, sort by newest)
- `POST /media` — নতুন ইমেজ যোগ করুন (base64 data URI বডি সহ)
- `DELETE /media/:id` — ডিলিট করুন
- সবই `requireAuth` দিয়ে সুরক্ষিত

**নতুন migration** `011_media_library.sql` — টেবিল ও ইনডেক্স তৈরি।

## ফ্রন্টএন্ড

**নতুন কম্পোনেন্ট** `src/components/dashboard/MediaLibrary.tsx`:
- মোডাল ডায়ালগ, দুটি ট্যাব: **"লাইব্রেরি"** ও **"নতুন আপলোড"**
- Library ট্যাব: গ্রিড ভিউ (থাম্বনেইল), সার্চ বার, প্রতিটি ইমেজে hover-এ **সিলেক্ট / ডিলিট** বাটন
- Upload ট্যাব: drag-and-drop + file picker, একাধিক ফাইল সাপোর্ট, ক্লায়েন্ট-সাইড কম্প্রেসন (আগের `imageCompress` লাইব্রেরি ব্যবহার করে)
- আপলোডের পর অটো লাইব্রেরিতে সেভ হয়ে সিলেক্ট হবে
- প্রতিটি জায়গার জন্য প্রস্তাবিত সাইজ hint দেখানো যাবে (prop হিসেবে)

**নতুন hook** `src/hooks/api/useMedia.ts` — react-query দিয়ে list/upload/delete।

**নতুন কম্পোনেন্ট** `src/components/dashboard/ImagePickerButton.tsx` — একটা রিইউজেবল বাটন/প্রিভিউ যেটা ক্লিক করলে MediaLibrary মোডাল খোলে। বর্তমান cover/photo/logo এলাকাগুলো এটি দিয়ে রিপ্লেস করা হবে।

## যেসব জায়গায় ইন্টিগ্রেট হবে

1. **Blog** (`dashboard/Blog.tsx`) — কভার ইমেজ + এডিটরের ভেতরের ছবি
2. **Projects** (`dashboard/Projects.tsx`) — কভার + inline
3. **Team** (`dashboard/Team.tsx`) — মেম্বারের ফটো
4. **Partners** (`dashboard/Partners.tsx`) — লোগো
5. **Gallery** (`dashboard/Gallery.tsx`) — আপলোড ফ্লো (Gallery-এর নিজস্ব list-ও আছে, কিন্তু media library থেকে সিলেক্টের সুযোগও থাকবে)
6. **Settings** (`dashboard/Settings.tsx`) — hero banner + যেকোনো ইমেজ ফিল্ড
7. **Messages** — attachment (যদি প্রযোজ্য)

সব জায়গায় একই MediaLibrary component ব্যবহার হবে — একবার আপলোড, সব জায়গায় রিইউজ।

## Migration চালানোর নির্দেশনা

আপনি phpMyAdmin এ `server/db/migrations/011_media_library.sql` ফাইলের SQL রান করবেন — আগের মতোই।

## ডেলিভারেবল

1. Backend: migration + `media.js` রাউট + `app.js`-এ register
2. Frontend: `MediaLibrary.tsx`, `ImagePickerButton.tsx`, `useMedia.ts`
3. ৭টি ড্যাশবোর্ড পেজে বর্তমান upload UI-গুলো নতুন picker দিয়ে রিপ্লেস
4. পুরনো compress লাইব্রেরি reuse — সাইজ hint প্রতিটি জায়গায় বজায় থাকবে

অ্যাপ্রুভ করলে ইমপ্লিমেন্ট শুরু করবো।
