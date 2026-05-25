// Mock data for admin dashboard — replace with Lovable Cloud queries later

export const kpis = [
  { key: "donations", label: "মোট দান", value: "৳ ৪৮,২৫,৭৩০", delta: "+১২.৪%", trend: "up", note: "গত মাসের তুলনায়" },
  { key: "donors", label: "মোট দাতা", value: "১২,৪৮৬", delta: "+৩২৪", trend: "up", note: "এই মাসে নতুন" },
  { key: "volunteers", label: "স্বেচ্ছাসেবক", value: "৩,৪৫০", delta: "+১১৮", trend: "up", note: "সক্রিয় সদস্য" },
  { key: "projects", label: "চলমান প্রকল্প", value: "২৪", delta: "৬ সমাপ্ত", trend: "flat", note: "এই বছর" },
];

export const donationTrend = [
  { d: "শনি", v: 28000 },
  { d: "রবি", v: 42000 },
  { d: "সোম", v: 51000 },
  { d: "মঙ্গল", v: 38000 },
  { d: "বুধ", v: 67000 },
  { d: "বৃহঃ", v: 54000 },
  { d: "শুক্র", v: 89000 },
];

export const channelSplit = [
  { name: "bKash", value: 42, color: "#E2136E" },
  { name: "Nagad", value: 24, color: "#EB5B27" },
  { name: "Rocket", value: 14, color: "#8C3494" },
  { name: "ব্যাংক", value: 12, color: "#006837" },
  { name: "কার্ড", value: 8, color: "#3B82F6" },
];

export type Donation = {
  id: string; name: string; phone: string; amount: number; method: string;
  area: string; date: string; status: "completed" | "pending" | "failed";
};

export const donations: Donation[] = [
  { id: "TXN-10248", name: "আব্দুর রহমান", phone: "01712345678", amount: 5000, method: "bKash", area: "এতিম শিশু", date: "২০২৬-০৫-২৫", status: "completed" },
  { id: "TXN-10247", name: "ফাতিমা খাতুন", phone: "01812345678", amount: 2000, method: "Nagad", area: "শিক্ষা", date: "২০২৬-০৫-২৫", status: "completed" },
  { id: "TXN-10246", name: "মুহাম্মদ ইব্রাহিম", phone: "01912345678", amount: 25000, method: "ব্যাংক", area: "মসজিদ নির্মাণ", date: "২০২৬-০৫-২৪", status: "pending" },
  { id: "TXN-10245", name: "আয়েশা সিদ্দিকা", phone: "01612345678", amount: 1000, method: "bKash", area: "খাদ্য সহায়তা", date: "২০২৬-০৫-২৪", status: "completed" },
  { id: "TXN-10244", name: "ইউসুফ হাসান", phone: "01512345678", amount: 50000, method: "কার্ড", area: "চিকিৎসা", date: "২০২৬-০৫-২৩", status: "completed" },
  { id: "TXN-10243", name: "খাদিজা বেগম", phone: "01312345678", amount: 500, method: "Rocket", area: "যেখানে প্রয়োজন", date: "২০২৬-০৫-২৩", status: "failed" },
  { id: "TXN-10242", name: "ওমর ফারুক", phone: "01711122233", amount: 10000, method: "bKash", area: "এতিম শিশু", date: "২০২৬-০৫-২২", status: "completed" },
  { id: "TXN-10241", name: "মরিয়ম আক্তার", phone: "01822233344", amount: 3000, method: "Nagad", area: "শিক্ষা", date: "২০২৬-০৫-২২", status: "completed" },
];

export type Application = {
  id: string; name: string; phone: string; city: string; type: string; date: string;
  status: "new" | "reviewing" | "approved" | "rejected";
};

export const volunteerApps: Application[] = [
  { id: "VOL-0420", name: "তানভীর হাসান", phone: "01711223344", city: "ঢাকা", type: "ত্রাণ বিতরণ", date: "২০২৬-০৫-২৫", status: "new" },
  { id: "VOL-0419", name: "সাদিয়া ইসলাম", phone: "01822334455", city: "চট্টগ্রাম", type: "শিক্ষা মেন্টরশিপ", date: "২০২৬-০৫-২৪", status: "reviewing" },
  { id: "VOL-0418", name: "রাকিবুল হাসান", phone: "01933445566", city: "সিলেট", type: "মিডিয়া ও কনটেন্ট", date: "২০২৬-০৫-২৩", status: "approved" },
  { id: "VOL-0417", name: "নুসরাত জাহান", phone: "01644556677", city: "রাজশাহী", type: "স্বাস্থ্যসেবা ক্যাম্প", date: "২০২৬-০৫-২২", status: "new" },
  { id: "VOL-0416", name: "মেহেদী হাসান", phone: "01555667788", city: "খুলনা", type: "ফান্ডরাইজিং", date: "২০২৬-০৫-২১", status: "approved" },
];

export const memberApps: Application[] = [
  { id: "MEM-0128", name: "আলহাজ্ব আব্দুল করিম", phone: "01711000111", city: "ঢাকা", type: "আজীবন সদস্য (৳৫০,০০০)", date: "২০২৬-০৫-২৫", status: "reviewing" },
  { id: "MEM-0127", name: "হাজী ইউনুস আলী", phone: "01822111222", city: "চট্টগ্রাম", type: "দাতা সদস্য (৳২৫,০০০)", date: "২০২৬-০৫-২৩", status: "approved" },
  { id: "MEM-0126", name: "ডঃ ফরিদা ইয়াসমিন", phone: "01933222333", city: "সিলেট", type: "সম্মানিত সদস্য (৳১,০০,০০০)", date: "২০২৬-০৫-২০", status: "approved" },
];

export const careerApps: Application[] = [
  { id: "JOB-0042", name: "আরিফুল ইসলাম", phone: "01711999888", city: "ঢাকা", type: "প্রোগ্রাম অফিসার", date: "২০২৬-০৫-২৫", status: "new" },
  { id: "JOB-0041", name: "শারমিন আক্তার", phone: "01822888777", city: "চট্টগ্রাম", type: "একাউন্টস / ফাইন্যান্স", date: "২০২৬-০৫-২৪", status: "reviewing" },
  { id: "JOB-0040", name: "নাহিদ হাসান", phone: "01933777666", city: "ঢাকা", type: "সফটওয়্যার / আইটি", date: "২০২৬-০৫-২২", status: "approved" },
];

export type Project = {
  id: string; title: string; category: string; budget: number; raised: number;
  beneficiaries: number; status: "active" | "completed" | "draft";
};

export const projects: Project[] = [
  { id: "P-024", title: "উত্তরাঞ্চল বন্যা ত্রাণ ২০২৬", category: "জরুরি সহায়তা", budget: 5000000, raised: 4250000, beneficiaries: 12500, status: "active" },
  { id: "P-023", title: "এতিম শিশু স্পনসরশিপ", category: "শিশু কল্যাণ", budget: 12000000, raised: 9800000, beneficiaries: 840, status: "active" },
  { id: "P-022", title: "ফ্রি মেডিকেল ক্যাম্প — সিলেট", category: "স্বাস্থ্যসেবা", budget: 800000, raised: 800000, beneficiaries: 2400, status: "completed" },
  { id: "P-021", title: "শীতবস্ত্র বিতরণ ২০২৫-২৬", category: "মৌসুমি সহায়তা", budget: 1500000, raised: 1500000, beneficiaries: 8000, status: "completed" },
  { id: "P-020", title: "মসজিদ নির্মাণ — কক্সবাজার", category: "ইবাদাহ", budget: 3500000, raised: 1850000, beneficiaries: 600, status: "active" },
];

export type BlogPost = {
  id: string; title: string; author: string; category: string; views: number;
  date: string; status: "published" | "draft" | "scheduled";
};

export const posts: BlogPost[] = [
  { id: "B-038", title: "যাকাত হিসাব করার সঠিক পদ্ধতি", author: "মুফতি আবু সালেহ", category: "ইসলামিক", views: 12480, date: "২০২৬-০৫-২৪", status: "published" },
  { id: "B-037", title: "এতিমের অধিকার — কুরআন ও সুন্নাহর আলোকে", author: "শাইখ আব্দুল্লাহ", category: "দাওয়াহ", views: 8920, date: "২০২৬-০৫-২০", status: "published" },
  { id: "B-036", title: "রমাদান ২০২৬: আমাদের পরিকল্পনা", author: "এডিটোরিয়াল টিম", category: "সংবাদ", views: 5640, date: "২০২৬-০৫-১৮", status: "published" },
  { id: "B-035", title: "মাসিক ইমপ্যাক্ট রিপোর্ট", author: "এডিটোরিয়াল টিম", category: "রিপোর্ট", views: 0, date: "২০২৬-০৫-৩০", status: "scheduled" },
];

export type Message = {
  id: string; name: string; email: string; subject: string; preview: string;
  date: string; status: "unread" | "read" | "replied";
};

export const messages: Message[] = [
  { id: "M-1284", name: "আব্দুর রহমান", email: "rahman@example.com", subject: "যাকাত সম্পর্কে জিজ্ঞাসা", preview: "আসসালামু আলাইকুম, আমার ব্যবসায়িক যাকাত হিসাব...", date: "১০ মিনিট আগে", status: "unread" },
  { id: "M-1283", name: "ফাতিমা খাতুন", email: "fatima@example.com", subject: "মাসিক দান বন্ধ করতে চাই", preview: "আমার অটো-পে বন্ধ করতে সাহায্য করুন...", date: "২ ঘণ্টা আগে", status: "unread" },
  { id: "M-1282", name: "Acme Corp", email: "csr@acme.com", subject: "Corporate Partnership Inquiry", preview: "We would like to partner with you for CSR...", date: "গতকাল", status: "replied" },
  { id: "M-1281", name: "মুহাম্মদ ইব্রাহিম", email: "ibrahim@example.com", subject: "দান রসিদ পাইনি", preview: "গত সপ্তাহের দানের রসিদ এখনো পাইনি...", date: "২ দিন আগে", status: "read" },
];

export const galleryItems = [
  { id: "G-128", title: "বন্যা ত্রাণ — কুড়িগ্রাম", album: "ত্রাণ কার্যক্রম", date: "২০২৬-০৫-২০", count: 24 },
  { id: "G-127", title: "এতিমখানা পরিদর্শন", album: "শিশু কল্যাণ", date: "২০২৬-০৫-১৫", count: 18 },
  { id: "G-126", title: "মেডিকেল ক্যাম্প — সিলেট", album: "স্বাস্থ্যসেবা", date: "২০২৬-০৫-১০", count: 36 },
  { id: "G-125", title: "মসজিদ উদ্বোধন — কক্সবাজার", album: "ইবাদাহ", date: "২০২৬-০৫-০৫", count: 12 },
];

export const recentActivity = [
  { type: "donation", text: "আব্দুর রহমান ৳৫,০০০ দান করেছেন", time: "১০ মিনিট আগে" },
  { type: "volunteer", text: "তানভীর হাসান স্বেচ্ছাসেবক হিসেবে আবেদন করেছেন", time: "২৫ মিনিট আগে" },
  { type: "member", text: "হাজী ইউনুস আলী দাতা সদস্যপদ অনুমোদিত", time: "১ ঘণ্টা আগে" },
  { type: "post", text: "নতুন ব্লগ প্রকাশিত: যাকাত হিসাব", time: "২ ঘণ্টা আগে" },
  { type: "message", text: "৩টি নতুন মেসেজ এসেছে", time: "৩ ঘণ্টা আগে" },
];
