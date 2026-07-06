## লক্ষ্য

ড্যাশবোর্ডে একটি নতুন **"ফর্ম ম্যানেজার"** সেকশন যোগ হবে, যেখানে ট্যাব আকারে সব পাবলিক ফর্ম থাকবে। প্রতিটি ফর্মের ফিল্ড লেবেল, placeholder, type, required/optional, options (select-এর জন্য), এবং ফিল্ড যোগ/বাদ — সব ড্যাশবোর্ড থেকে কনফিগার করা যাবে। কনফিগ ব্যাকএন্ডে সেভ হবে এবং পাবলিক পেজগুলো সেটা থেকে ফর্ম রেন্ডার করবে।

## স্কোপ (৫টি ফর্ম)

1. **স্বেচ্ছাসেবক** (`/volunteer` → volunteer tab)
2. **জেলা প্রতিনিধি** (`/volunteer` → representative tab)
3. **নিয়মিত দাতা** (Donate পেজের donor sign-up)
4. **আজীবন সদস্য**
5. **দাতা সদস্য**

## Backend (server/)

### নতুন migration `014_form_schemas.sql`
```sql
CREATE TABLE form_schemas (
  form_key VARCHAR(64) PRIMARY KEY,   -- volunteer, representative, donor, member_lifetime, member_donor
  title VARCHAR(200),
  subtitle TEXT,
  fields LONGTEXT,                     -- JSON: [{key,label,placeholder,type,required,options,order,help}]
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```
Seed row per form with existing field definitions extracted from `Volunteer.tsx` / `Donate.tsx`.

### নতুন route `server/routes/forms.js`
- `GET /forms` — public: সব ফর্ম স্কিমা
- `GET /forms/:key` — public: একটি ফর্ম
- `PUT /forms/:key` — admin only (permission `settings`): title/subtitle/fields update
- `POST /forms/:key/reset` — admin: default-এ ফেরত

Field JSON shape:
```json
{
  "key": "name",
  "label": "পূর্ণ নাম",
  "placeholder": "আপনার নাম",
  "type": "text|email|phone|number|textarea|select|checkbox-group|date",
  "required": true,
  "options": ["ঢাকা", "চট্টগ্রাম"],
  "help": "",
  "order": 1
}
```

## Dashboard (নতুন)

### Route: `/dashboard/forms` (menu item: "ফর্ম ম্যানেজার", icon `FormInput`)

### Page `src/pages/dashboard/FormsManager.tsx`
- Top tabs: ৫টি ফর্ম key
- প্রতিটি ট্যাবে:
  - Title + subtitle এডিটর
  - Draggable field list (dnd-kit) — reorder সাপোর্ট
  - প্রতিটি রো-তে: label, placeholder, type dropdown, required switch, options editor (select হলে), delete
  - "+ নতুন ফিল্ড যোগ করুন" বাটন
  - "সংরক্ষণ" ও "ডিফল্ট-এ ফেরত" বাটন
- Live preview panel (right side): কনফিগ অনুযায়ী রেন্ডার্ড ফর্মের প্রিভিউ

### Components
- `src/components/dashboard/FormFieldEditor.tsx` — একটি ফিল্ড row edit UI
- `src/components/forms/DynamicForm.tsx` — কনফিগ থেকে ফর্ম রেন্ডার + zod validation dynamic build

## Public pages update

### `src/pages/Volunteer.tsx`
- হার্ডকোডেড `VolunteerForm` ও `RepresentativeForm` → `<DynamicForm formKey="volunteer" />` ও `<DynamicForm formKey="representative" />` দিয়ে replace
- Submit logic (`saveApplication`, WhatsApp URL) `DynamicForm`-এর `onSubmit` prop-এ pass
- হার্ডকোডেড লেবেল/i18n keys backend defaults-এ চলে যাবে; সাফল্যের কার্ড আগের মতোই থাকবে

### `src/pages/Donate.tsx` + membership sections
- Donor/member forms → `<DynamicForm formKey="donor" />` ইত্যাদি

## Error-free guarantee

1. **Zod schema dynamic**: field type + required থেকে auto-build (text→string.min(1), email→email(), phone→regex, number→coerce.number(), select→enum)
2. **Backwards-compat**: fixed system keys (name, phone, email) protected — delete করা যাবে না, শুধু label/placeholder edit
3. **Fallback**: backend fetch fail হলে hardcoded default JSON ব্যবহৃত হবে (bundled in `src/data/formDefaults.ts`)
4. **Submit payload**: dynamic → API-তে `{fields: {...}}` shape, existing `/applications/*` routes accept extra fields via existing `extra` param

## টেকনিক্যাল বিবরণ

- **Files added**: `server/db/migrations/014_form_schemas.sql`, `server/routes/forms.js`, `src/pages/dashboard/FormsManager.tsx`, `src/components/dashboard/FormFieldEditor.tsx`, `src/components/forms/DynamicForm.tsx`, `src/data/formDefaults.ts`, `src/hooks/api/useForms.ts`
- **Files edited**: `server/app.js` (mount route), `src/App.tsx` (route), `src/components/dashboard/DashboardLayout.tsx` (menu), `src/lib/permissions.ts` (add `forms` perm), `src/pages/Volunteer.tsx` (use DynamicForm), `src/pages/Donate.tsx` (use DynamicForm for donor/member sections)
- **Deps**: `@dnd-kit/core @dnd-kit/sortable` for drag-reorder

## ডেলিভারি ক্রম

1. Migration + backend route + seed defaults
2. `DynamicForm` component + `formDefaults.ts`
3. Dashboard FormsManager UI + menu entry
4. Refactor Volunteer.tsx to use DynamicForm
5. Refactor Donate.tsx donor/member forms
6. QA: প্রতিটি ফর্ম add/edit/delete/reorder/save/reset test

অনুমোদন করলে বাস্তবায়ন শুরু করব।