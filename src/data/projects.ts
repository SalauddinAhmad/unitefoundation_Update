export type Category =
  | "দাওয়াহ"
  | "মাদরাসা"
  | "মাসজিদ"
  | "ইয়াতিম"
  | "শিক্ষা"
  | "ফিলিস্তিন"
  | "পথশিশু"
  | "দুর্যোগ"
  | "শীতবস্ত্র"
  | "কুরবানী"
  | "কর্জ-এ-হাসানাহ"
  | "ইউনাইট টিভি";

export interface Project {
  id: string;
  slug: string;
  title: string;
  category: Category;
  shortDescription: string;
  description: string;
  image: string;
  gallery: string[];
  target: number; // in BDT
  raised: number;
  donors: number;
  urgent?: boolean;
  location: string;
}


export const formatBDT = (n: number) =>
  new Intl.NumberFormat("bn-BD", { maximumFractionDigits: 0 }).format(n);

export const toBnNum = (n: number | string) =>
  String(n).replace(/[0-9]/g, (d) => "০১২৩৪৫৬৭৮৯"[+d]);
