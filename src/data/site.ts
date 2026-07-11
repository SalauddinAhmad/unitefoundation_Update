export const site = {
  name: "ইউনাইট ফাউন্ডেশন",
  nameEn: "Unite Foundation",
  tagline: "সুন্নাহর অনুসরণে, মানবতার কল্যাণে।",
  taglineEn: "Following the Sunnah, Serving Humanity.",
  email: "info@unitefoundation.bd",
  website: "https://unitefoundation.bd",
  phone: "+৮৮০ ১৬১৪-২৬৪৯০১",
  whatsapp: "8801614264901", // E.164 without +
  address: "উত্তরখান, উত্তরা, ঢাকা ১২৩০।",
  // Manual payment channels
  payments: {
    bkash: { number: "01759-754265", type: "Personal" },
    nagad: { number: "01759-754265", type: "Personal" },
    rocket: { number: "01759-754265-0", type: "Personal" },
    bank: {
      bank: "Islami Bank Bangladesh Ltd.",
      branch: "Uttara",
      account: "Unite Training Center",
      number: "20502070100758906",
      routing: "IBBLBDDH207",
    },
    banks: [
      {
        bank: "Islami Bank Bangladesh",
        branch: "Uttara",
        account: "Unite Training Center",
        number: "20502070100758906",
        routing: "",
        swift: "",
      },
      {
        bank: "City Bank",
        branch: "Uttara",
        account: "Unite Training Center",
        number: "1254971392001",
        routing: "225264634",
        swift: "CIBLBDDH",
      },
    ],
    qrImage: "", // Bangla QR — এখানে QR image path বসাও (e.g. "/qr/unite-bangla-qr.png")
  },
  socials: {
    facebook: "https://www.facebook.com/UniteFoundation.UniteTv",
    youtube: "https://youtube.com/@unite.foundation",
    instagram: "https://instagram.com/unitefoundation",
    tvFacebook: "https://www.facebook.com/unitetv",
    tvYoutube: "https://www.youtube.com/@UniteTelevision",
  },
};

export const nav = [
  { label: "হোম", href: "/" },
  { label: "কার্যক্রম", href: "/projects" },
  { label: "আমাদের সম্পর্কে", href: "/about" },
  { label: "গ্যালারি", href: "/gallery" },
  { label: "ব্লগ", href: "/blog" },
  { label: "স্বেচ্ছাসেবক", href: "/volunteer" },
  { label: "যোগাযোগ", href: "/contact" },
  { label: "দান করুন", href: "/donate" },
];
