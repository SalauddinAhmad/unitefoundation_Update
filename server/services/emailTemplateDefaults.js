// ================================================================
// Editable email-template defaults + UI field descriptors.
// Shared between the render code (emailTemplate.js) and the
// Dashboard editor route (routes/emailTemplates.js).
//
// Each template exposes:
//   subject:  ইমেইলের বিষয় (single line, supports {{vars}})
//   slots:    ছোট ছোট editable text piece — এগুলোর মধ্যে
//             {{variable}} placeholder থাকতে পারে যা render-এর
//             সময় বাস্তব ডেটা দিয়ে replace হয়।
//
// এই ফাইলে কোনো secret নেই — নিরাপদভাবে server + editor উভয়
// জায়গায় ব্যবহার করা যায়।
// ================================================================

const TEMPLATES = {
  admin_created: {
    label: 'নতুন অ্যাডমিন অ্যাকাউন্ট',
    description: 'সুপার অ্যাডমিন নতুন কাউকে dashboard-এ যোগ করলে যে ইমেইল যায়।',
    variables: [
      { key: 'name', desc: 'নতুন অ্যাডমিনের নাম' },
      { key: 'email', desc: 'তার লগইন ইমেইল' },
      { key: 'password', desc: 'অস্থায়ী পাসওয়ার্ড' },
    ],
    fields: [
      { key: 'subject', label: 'বিষয় (Subject)', type: 'text' },
      { key: 'title', label: 'হেডলাইন', type: 'text' },
      { key: 'preheader', label: 'ইনবক্স প্রিভিউ', type: 'text' },
      { key: 'greeting', label: 'সালাম / সম্বোধন', type: 'text' },
      { key: 'intro', label: 'মূল বার্তা', type: 'textarea' },
      { key: 'cta_label', label: 'বাটনের লেখা', type: 'text' },
      { key: 'note', label: 'নিচের নোট', type: 'textarea' },
    ],
    defaults: {
      subject: 'স্বাগতম! আপনার অ্যাডমিন অ্যাকাউন্ট প্রস্তুত',
      slots: {
        title: 'স্বাগতম! আপনার অ্যাডমিন অ্যাকাউন্ট প্রস্তুত',
        preheader: 'Unite Foundation ড্যাশবোর্ডে আপনার লগইন তথ্য',
        greeting: 'আসসালামু আলাইকুম {{name}},',
        intro: 'Unite Foundation-এর ম্যানেজমেন্ট ড্যাশবোর্ডে আপনার জন্য একটি অ্যাকাউন্ট তৈরি করা হয়েছে। নিচের তথ্য দিয়ে লগইন করুন এবং প্রথম লগইনের পর অবশ্যই পাসওয়ার্ড পরিবর্তন করে নিন।',
        cta_label: 'ড্যাশবোর্ডে লগইন করুন',
        note: 'নিরাপত্তার স্বার্থে এই ইমেইলটি অন্য কারো সাথে শেয়ার করবেন না।',
      },
    },
    sample: { name: 'জনাব করিম', email: 'karim@example.com', password: 'Uf#2026Xy' },
  },

  password_changed: {
    label: 'পাসওয়ার্ড রিসেট (অ্যাডমিন কর্তৃক)',
    description: 'সুপার অ্যাডমিন কোনো ইউজারের পাসওয়ার্ড রিসেট করলে যে ইমেইল যায়।',
    variables: [{ key: 'password', desc: 'নতুন অস্থায়ী পাসওয়ার্ড' }],
    fields: [
      { key: 'subject', label: 'বিষয়', type: 'text' },
      { key: 'title', label: 'হেডলাইন', type: 'text' },
      { key: 'preheader', label: 'ইনবক্স প্রিভিউ', type: 'text' },
      { key: 'intro', label: 'মূল বার্তা', type: 'textarea' },
      { key: 'cta_label', label: 'বাটনের লেখা', type: 'text' },
      { key: 'note', label: 'নিচের নোট', type: 'textarea' },
    ],
    defaults: {
      subject: 'আপনার নতুন পাসওয়ার্ড',
      slots: {
        title: 'আপনার নতুন পাসওয়ার্ড',
        preheader: 'অ্যাডমিন কর্তৃক আপনার পাসওয়ার্ড রিসেট করা হয়েছে',
        intro: 'একজন সুপার অ্যাডমিন আপনার অ্যাকাউন্টের পাসওয়ার্ড রিসেট করেছেন। নিচের অস্থায়ী পাসওয়ার্ড দিয়ে লগইন করে দ্রুততম সময়ে নতুন একটি পাসওয়ার্ড সেট করে নিন।',
        cta_label: 'এখনই লগইন করুন',
        note: 'আপনি এই পরিবর্তনের অনুরোধ না করে থাকলে এখনই সুপার অ্যাডমিনের সাথে যোগাযোগ করুন।',
      },
    },
    sample: { password: 'Uf#Reset42' },
  },

  forgot_password: {
    label: 'পাসওয়ার্ড রিসেট লিংক (ইউজার অনুরোধ)',
    description: '"পাসওয়ার্ড ভুলে গেছি" থেকে অনুরোধ এলে যে ইমেইল যায়।',
    variables: [{ key: 'reset_url', desc: 'রিসেট লিংক' }],
    fields: [
      { key: 'subject', label: 'বিষয়', type: 'text' },
      { key: 'title', label: 'হেডলাইন', type: 'text' },
      { key: 'preheader', label: 'ইনবক্স প্রিভিউ', type: 'text' },
      { key: 'intro', label: 'মূল বার্তা', type: 'textarea' },
      { key: 'cta_label', label: 'বাটনের লেখা', type: 'text' },
      { key: 'note', label: 'নিচের নোট', type: 'textarea' },
    ],
    defaults: {
      subject: 'পাসওয়ার্ড রিসেট অনুরোধ',
      slots: {
        title: 'পাসওয়ার্ড রিসেট অনুরোধ',
        preheader: 'পাসওয়ার্ড রিসেট লিংক — ১ ঘণ্টায় মেয়াদ শেষ',
        intro: 'আপনার অ্যাকাউন্টের পাসওয়ার্ড রিসেট করার একটি অনুরোধ আমরা পেয়েছি। নিচের বাটনে ক্লিক করে নতুন পাসওয়ার্ড সেট করুন।',
        cta_label: 'পাসওয়ার্ড রিসেট করুন',
        note: 'লিংকটি <b>১ ঘণ্টা</b> পর্যন্ত সক্রিয় থাকবে। আপনি এই অনুরোধ না করে থাকলে ইমেইলটি উপেক্ষা করুন।',
      },
    },
    sample: { reset_url: 'https://unitefoundation.bd/reset?token=demo' },
  },

  login_otp: {
    label: 'লগইন OTP কোড',
    description: 'অ্যাডমিন লগইনের সময় পাঠানো ৬-সংখ্যার OTP।',
    variables: [{ key: 'code', desc: '৬-সংখ্যার OTP কোড' }],
    fields: [
      { key: 'subject', label: 'বিষয়', type: 'text' },
      { key: 'title', label: 'হেডলাইন', type: 'text' },
      { key: 'preheader', label: 'ইনবক্স প্রিভিউ', type: 'text' },
      { key: 'intro', label: 'মূল বার্তা (কোডের উপরে)', type: 'textarea' },
      { key: 'note', label: 'নিচের নোট', type: 'textarea' },
    ],
    defaults: {
      subject: 'আপনার লগইন কোড',
      slots: {
        title: 'আপনার লগইন কোড',
        preheader: 'Unite Foundation OTP: {{code}}',
        intro: 'নিচের ৬-সংখ্যার কোডটি ব্যবহার করে লগইন সম্পন্ন করুন। কোডটি <b>৫ মিনিটের</b> জন্য কার্যকর।',
        note: 'কোডটি কারো সাথে শেয়ার করবেন না — আমাদের কোনো টিম মেম্বার আপনার কাছে এই কোড চাইবে না।',
      },
    },
    sample: { code: '482913' },
  },

  donation_receipt: {
    label: 'দানের রসিদ (SSLCommerz সফল পেমেন্ট)',
    description: 'সফল দানের পর দাতার কাছে যাওয়া রসিদ।',
    variables: [
      { key: 'name', desc: 'দাতার নাম' },
      { key: 'amount', desc: 'দানের পরিমাণ (৳)' },
      { key: 'tran_id', desc: 'ট্রানজেকশন আইডি' },
    ],
    fields: [
      { key: 'subject', label: 'বিষয়', type: 'text' },
      { key: 'hero_title', label: 'হিরো হেডলাইন', type: 'text' },
      { key: 'hero_subtitle', label: 'হিরো সাবটাইটেল', type: 'textarea' },
      { key: 'amount_label', label: '"দানের পরিমাণ" ছোট লেবেল', type: 'text' },
      { key: 'salutation', label: 'সালাম লাইন', type: 'text' },
      { key: 'main_message', label: 'মূল বার্তা', type: 'textarea' },
      { key: 'cta_label', label: 'বাটনের লেখা', type: 'text' },
      { key: 'cta_note', label: 'বাটনের নিচের ছোট নোট', type: 'text' },
      { key: 'signature_prefix', label: 'সিগনেচার শুরুর লাইন', type: 'text' },
      { key: 'signature_name', label: 'সিগনেচারের নাম', type: 'text' },
      { key: 'signature_title', label: 'সিগনেচার পদবি', type: 'text' },
    ],
    defaults: {
      subject: 'আপনার দানের রসিদ — Unite Foundation',
      slots: {
        hero_title: 'আল-হামদুলিল্লাহ!',
        hero_subtitle: 'আপনার অনুদানটি আমরা সফলভাবে গ্রহণ করেছি। জাযাকাল্লাহু খাইরান!',
        amount_label: 'দানের পরিমাণ',
        salutation: 'আস-সালামু আলাইকুম, {{name}}',
        main_message: 'ইউনাইট ফাউন্ডেশনের ওপর আস্থা রাখার জন্য জাযাকাল্লাহু খাইরান। আপনার এই মূল্যবান দান আমাদের দাওয়াহ ও সেবামূলক কাজকে আরও একধাপ এগিয়ে নিয়ে যেতে সহজ হবে ইনশাআল্লাহ। মহান আল্লাহ আপনার দান কবুল করুন এবং আপনার রিজিকে বারাকাহ দান করুন, আমীন!',
        cta_label: 'রসিদ অনলাইনে দেখুন',
        cta_note: 'এই ইমেইলটি আপনার দানের অফিসিয়াল রসিদ হিসেবে সংরক্ষণ করে রাখুন।',
        signature_prefix: 'শুভেচ্ছান্তে,',
        signature_name: 'আব্দুল্লাহ বিন এরশাদ',
        signature_title: 'চেয়ারম্যান, ইউনাইট ফাউন্ডেশন, ঢাকা',
      },
    },
    sample: {
      name: 'জনাব রহিম',
      amount: 5000,
      tran_id: 'UF-20260720-0001',
      method: 'SSLCommerz',
      card_type: 'bKash',
      bank_tran_id: 'BK123456789',
      purpose: 'সাধারণ দান',
      date: new Date().toLocaleString('bn-BD'),
    },
  },
};

const KEYS = Object.keys(TEMPLATES);

/** Fill {{var}} placeholders with vars[var]; unknown vars remain visible. */
function fill(tpl, vars = {}) {
  if (tpl == null) return '';
  return String(tpl).replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (_, k) => {
    return vars[k] == null ? `{{${k}}}` : String(vars[k]);
  });
}

// Every template supports a `html_override` slot — non-visible in the
// normal field grid; the editor exposes it through a dedicated
// "HTML কোড দেখুন / এডিট করুন" button. If non-empty it completely
// replaces the default rendered HTML (variables still filled).
for (const k of Object.keys(TEMPLATES)) {
  TEMPLATES[k].defaults.slots.html_override = '';
}

/** Return {subject, slots} for a key, merged with saved overrides (may be undefined). */
function mergeWithDefaults(key, override) {
  const def = TEMPLATES[key];
  if (!def) return null;
  const o = override && typeof override === 'object' ? override : {};
  const oSlots = o.slots && typeof o.slots === 'object' ? o.slots : {};
  return {
    subject: (o.subject || def.defaults.subject) + '',
    slots: { ...def.defaults.slots, ...oSlots },
  };
}

module.exports = { TEMPLATES, KEYS, fill, mergeWithDefaults };
