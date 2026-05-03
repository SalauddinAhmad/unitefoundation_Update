# Unite Foundation — Build Plan

A premium, institutional-style Islamic charity website inspired by As-Sunnah Foundation. Bengali-primary with English accents, donation-focused throughout, and built to feel like a real high-trust foundation — not a template.

> **Stack note:** This Lovable project runs on **React 18 + Vite + React Router + Tailwind + TypeScript**. AGENTS.md specifies Next.js App Router, which Lovable doesn't support — but every other rule (design system, donation priority, structure, conventions, performance) will be followed strictly. Routing is functionally equivalent.

---

## Design System (from design.md)

**Colors** — wired into Tailwind via HSL CSS variables in `index.css`:
- Donation Red `#ED2324`, Orange `#F57E20` (gradient `135deg`)
- Primary Green `#006837`, Donation Highlight `#FBB03B`
- Footer `#0C2B1D`, Text `#1A1A1A` / `#666`, Bg `#F9F9F9`, Card `#FFF`

**Typography** — Bornomala/Anek Bangla (Bengali, primary) + Ubuntu Sans (English) loaded via Google Fonts. Bengali set as default body font; English used for numbers, accents, and the optional EN header label.

**Spacing** — Container max 1280–1536px, section padding 80–120px desktop / 20px mobile, airy whitespace.

**Radius** — Cards 16px, buttons 12px (added as Tailwind tokens `rounded-card` / `rounded-btn`).

**Shadows** — Subtle resting shadow, deeper on hover with a slight lift transform.

---

## Pages & Routes

```
/                      Homepage
/projects              All projects/activities grid + filter
/projects/:slug        Single project detail + donation panel
/donate                Donation page (project + amount + form)
/blog                  Blog/content listing
/blog/:slug            Blog post detail
```

### 1. Homepage (strict order from design.md §3)
1. **Sticky Header** — logo left, Bengali nav center (হোম · আমাদের সম্পর্কে · প্রকল্পসমূহ · ব্লগ · যোগাযোগ), gradient "দান করুন" button right
2. **Hero Carousel** — 3 slides, dark overlay 18%, large Bengali headline + English subline, dual CTA (Donate Now primary gradient / Learn More secondary outline)
3. **About** — two-column: mission statement + image, "আমরা কারা" with a short verse/hadith quote treatment
4. **Activities / Programs** — 6 program cards (Food relief, Orphan sponsorship, Water wells, Education, Mosque construction, Winter clothing)
5. **Quick Donation Block** — `#FBB03B` background band, project select + preset amounts (৳500/1000/2500/5000/custom) + name/phone, prominent CTA
6. **Content / Blog** — 3 latest article cards
7. **Impact Statistics** — animated counters (মানুষকে সাহায্য, প্রকল্প সম্পন্ন, স্বেচ্ছাসেবক, দেশ)
8. **Trust strip** — partner/verification logos, transparency note
9. **Footer** — dark green `#0C2B1D`, 4 columns + newsletter + social + copyright

### 2. Projects Page
Grid of ProjectCards with category filter chips (সব · ত্রাণ · এতিম · শিক্ষা · পানি · মসজিদ), donation progress bar on each card.

### 3. Single Project
Hero image, title, category badge, long description, progress bar with raised/goal/donors count, image gallery, sticky donation panel on the side, related projects.

### 4. Donation Page
Three-step flow on one screen:
- **Step 1:** Project selection (cards)
- **Step 2:** Amount (presets + custom, frequency: one-time / monthly)
- **Step 3:** Donor info (name, phone, email, optional message, anonymous toggle)

On submit → modal with **manual payment instructions**: bKash personal/merchant number, Nagad, bank account, and a "WhatsApp confirmation" button that opens `wa.me/...` with a pre-filled message (name + amount + project). All inputs validated with **zod** (length, phone format, encodeURIComponent for the WhatsApp URL).

### 5. Blog
Grid listing with category and read-time, detail page with typography-tuned prose, share buttons, related posts.

---

## Reusable Components

```
src/components/
  layout/        Header, Footer, Container, SectionHeading
  home/          Hero, AboutSection, QuickDonate, ImpactStats, TrustStrip
  project/       ProjectCard, ProgressBar, CategoryFilter, ProjectGallery
  donation/      DonationForm, AmountPicker, PaymentInstructionsModal,
                 StickyDonatePanel
  blog/          BlogCard, BlogProse
  ui/            (existing shadcn primitives)
```

All cards `rounded-[16px]`, buttons `rounded-[12px]`, donation CTAs use the red→orange gradient with hover lift.

---

## Content (realistic, no lorem ipsum)

Hardcoded TypeScript data files:
- `src/data/projects.ts` — 8 projects with Bengali titles/descriptions, categories, target/raised amounts in ৳, donor counts, slugs
- `src/data/blog.ts` — 6 articles (Ramadan appeal, water-well field report, orphan sponsorship story, etc.)
- `src/data/impact.ts` — stats numbers
- `src/data/site.ts` — foundation contact info, bKash/Nagad/bank numbers, WhatsApp number, social links (placeholders the user edits in one place)

Hero/program imagery generated as optimized assets in `src/assets/` (humanitarian aid, water wells, orphan care, mosque, education — respectful, no faces of vulnerable people in distress).

---

## Donation Conversion Hooks (per AGENTS.md §13)

- Sticky header Donate button always visible
- Hero primary CTA = Donate
- Quick Donate band on homepage above the fold on tablet+
- Every ProjectCard ends with "এখনই দান করুন"
- Sticky side panel on project detail
- Floating mobile bottom bar with Donate CTA
- Footer CTA strip before copyright

---

## Technical Details

- **Routing:** React Router with all 6 routes registered above the catch-all in `App.tsx`
- **Validation:** zod schemas for donation + newsletter forms; phone regex for BD numbers (`01[3-9]XXXXXXXX`)
- **SEO:** `react-helmet-async` per page (title, description, og tags) + semantic HTML, `lang="bn"` on `<html>`
- **Performance:** lazy-load route components with `React.lazy`, `loading="lazy"` on below-fold images, AVIF/WebP via Vite asset pipeline, intersection-observer counters
- **Fonts:** Google Fonts `<link>` in `index.html` with `display=swap`, preconnect
- **Accessibility:** focus rings on all CTAs, ARIA labels on icon buttons, color contrast checked on gradient buttons (white text)
- **No backend:** donation form submissions trigger the payment-instructions modal only; no data persisted

---

## Out of Scope (can add later)

- Stripe/online payment processing
- Admin/CMS for blog & projects
- User accounts / donation history
- EN/BN language toggle (currently Bengali-primary with English accents only)
- Contact form backend (will show contact info instead)
