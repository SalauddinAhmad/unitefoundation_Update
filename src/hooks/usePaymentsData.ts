// Resolve donation payment data (mobiles, banks, QR, sslcommerz) from
// live site settings when available, falling back to the static defaults
// baked into `src/data/site.ts`. This lets admins fully customise the
// donation channels from the dashboard's Settings → পেমেন্ট অ্যাকাউন্ট tab
// without needing a code change.
import { useSettings } from "@/hooks/api/useDashboardData";
import { site } from "@/data/site";

export type BankEntry = {
  bank: string;
  branch: string;
  account: string;
  number: string;
  routing: string;
  swift: string;
};

export type PaymentsData = {
  mobiles: { bkash: string; nagad: string; rocket: string };
  banks: BankEntry[];
  primaryBank: BankEntry;
  qrImage: string;
  sslcommerzStoreId: string;
};

export function usePaymentsData(): PaymentsData {
  const { data } = useSettings();
  const p: any = data?.payments || {};

  const mobiles = {
    bkash: p.bkash || site.payments.bkash.number,
    nagad: p.nagad || site.payments.nagad.number,
    rocket: p.rocket || site.payments.rocket.number,
  };

  const rawBanks: BankEntry[] =
    Array.isArray(p.banks) && p.banks.length
      ? p.banks.map((b: any) => ({
          bank: b.bank || "",
          branch: b.branch || "",
          account: b.account || "",
          number: b.number || "",
          routing: b.routing || "",
          swift: b.swift || "",
        }))
      : site.payments.banks.map((b) => ({ ...b }));

  const primaryBank = rawBanks[0] || {
    bank: site.payments.bank.bank,
    branch: site.payments.bank.branch,
    account: site.payments.bank.account,
    number: site.payments.bank.number,
    routing: site.payments.bank.routing || "",
    swift: site.payments.bank.swift || "",
  };

  return {
    mobiles,
    banks: rawBanks,
    primaryBank,
    qrImage: p.qr_image || site.payments.qrImage || "",
    sslcommerzStoreId: p.sslcommerz_store_id || "",
  };
}
