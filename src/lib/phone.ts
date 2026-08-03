/** Convert Bengali/Arabic-Indic digits to ASCII digits. */
function toAsciiDigits(input: string): string {
  return input.replace(/[০-৯٠-٩]/g, (ch) => {
    const code = ch.charCodeAt(0);
    if (code >= 0x09e6 && code <= 0x09ef) return String(code - 0x09e6);
    return String(code - 0x0660);
  });
}

/**
 * Normalize a Bangladeshi phone number to international format (8801XXXXXXXXX)
 * for use in wa.me links. Returns null when the number is not usable.
 */
export function toWhatsAppNumber(raw?: string | null): string | null {
  if (!raw) return null;
  let d = toAsciiDigits(String(raw)).replace(/\D/g, "");
  if (!d) return null;

  // 008801... -> 8801...
  if (d.startsWith("00")) d = d.slice(2);
  // 8801XXXXXXXXX (13 digits)
  if (d.startsWith("880")) {
    return d.length === 13 ? d : null;
  }
  // 01XXXXXXXXX (11 digits)
  if (d.startsWith("01") && d.length === 11) return `88${d}`;
  // 1XXXXXXXXX (10 digits, missing leading 0)
  if (d.startsWith("1") && d.length === 10) return `880${d}`;
  // 88 + 1XXXXXXXXX without the 0 (wrongly stored)
  if (d.startsWith("881") && d.length === 12) return `880${d.slice(2)}`;

  // Other international numbers: pass through if plausible
  return d.length >= 10 && d.length <= 15 ? d : null;
}

export function whatsAppLink(raw?: string | null, text?: string): string | null {
  const n = toWhatsAppNumber(raw);
  if (!n) return null;
  return `https://wa.me/${n}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
}
