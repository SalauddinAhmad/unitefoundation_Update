// ============================================================
// Locale-aware number formatting.
// - Bangla → বাংলা numerals (bn-BD)
// - English → Western numerals (en-IN grouping)
// ============================================================
import { useTranslation } from "react-i18next";

export const useLocaleNum = () => {
  const { i18n } = useTranslation();
  const isBn = (i18n.language || "bn").startsWith("bn");

  const fmt = (n: number | string) => {
    const num = typeof n === "string" ? Number(n) : n;
    if (!Number.isFinite(num)) return String(n);
    return isBn
      ? num.toLocaleString("bn-BD")
      : num.toLocaleString("en-IN");
  };

  return { fmt, isBn };
};
