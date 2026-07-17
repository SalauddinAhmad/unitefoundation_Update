// Client-side mirror of server/utils/emailValidator.js.
// Provides zod-friendly refine + a lightweight standalone check.
// Kept in sync manually with the server list; if the server list changes, update here too.

const DISPOSABLE_DOMAINS = new Set<string>([
  "0-mail.com","10minutemail.com","10minutemail.net","10minutemail.co.uk","10minutemail.de",
  "10minutemail.us","20minutemail.com","30minutemail.com","1secmail.com","1secmail.net",
  "1secmail.org","33mail.com","tempmail.com","temp-mail.org","temp-mail.io","temp-mail.ru",
  "tempmail.io","tempmail.net","tempmail.us.com","tempmail.plus","tempmailer.com","tempmailo.com",
  "tempmailin.com","tmail.com","tmail.ws","tmails.net","tmailinator.com","tmpmail.net","tmpmail.org",
  "tmpeml.com","mytemp.email","mailinator.com","mailinator.net","mailinator.org","mailinator2.com",
  "mailinater.com","mailinator.info","binkmail.com","bobmail.info","safetymail.info","sogetthis.com",
  "spamherelots.com","suremail.info","zippymail.info","guerrillamail.com","guerrillamail.net",
  "guerrillamail.org","guerrillamail.biz","guerrillamail.de","guerrillamailblock.com","sharklasers.com",
  "grr.la","spam4.me","pokemail.net","yopmail.com","yopmail.fr","yopmail.net","trashmail.com",
  "trashmail.de","trashmail.net","trashmail.org","trashmail.ws","trashmail.io","trashmail.me",
  "trashinbox.com","trash-mail.com","trash-mail.de","trashymail.com","wegwerfmail.de","wegwerfmail.net",
  "wegwerfmail.org","fakeinbox.com","fake-mail.net","fakemail.fr","fakemailz.com","getairmail.com",
  "getnada.com","nada.email","nada.ltd","maildrop.cc","mailcatch.com","mailnesia.com","mailtemp.info",
  "mail-temporaire.fr","mail-temporaire.com","mail.tm","emailondeck.com","emailtemp.org","email-temp.com",
  "emailtemporario.com.br","emailtemporanea.com","disposablemail.com","discard.email","discardmail.com",
  "discardmail.de","anonaddy.me","anonaddy.com","burnermail.io","burnthis.email","deadaddress.com",
  "dumpmail.de","harakirimail.com","hidemail.de","ieatspam.eu","ieatspam.info","incognitomail.com",
  "incognitomail.net","incognitomail.org","kasmail.com","mailexpire.com","meltmail.com","mintemail.com",
  "mytrashmail.com","spamgourmet.com","spamgourmet.net","spamgourmet.org","spam.la","spam.su",
  "spambog.com","spambog.de","spambog.ru","spambox.us","teleworm.com","teleworm.us","throwawayemailaddress.com",
  "willselfdestruct.com","yuurok.com","zoemail.net","armyspy.com","cuvox.de","dayrep.com","einrot.com",
  "fleckens.hu","gustr.com","jourrapide.com","superrito.com","emltmp.com","tempinbox.com","tempinbox.co.uk",
]);

const SUSPICIOUS_LOCAL = /^(test|test\d*|abc|abcd|xyz|asdf|qwerty|demo|fake|dummy|sample|noreply|no-reply|admin|user|user\d+|foo|bar|baz|aaa|bbb|ccc|123|1234|12345|null|undefined|anonymous|anon|na|nan|none|nothing)$/i;

export type EmailIssue = "invalid" | "disposable" | "suspicious";
export type EmailCheck = { ok: true } | { ok: false; code: EmailIssue; message: string };

export function checkEmail(email: string): EmailCheck {
  const raw = String(email || "").trim().toLowerCase();
  if (!raw) return { ok: false, code: "invalid", message: "ইমেইল প্রদান করুন।" };
  const m = raw.match(/^([^\s@]+)@([^\s@]+\.[^\s@]+)$/);
  if (!m) return { ok: false, code: "invalid", message: "সঠিক ইমেইল প্রদান করুন।" };
  const [, local, domain] = m;
  if (DISPOSABLE_DOMAINS.has(domain)) {
    return { ok: false, code: "disposable", message: "অস্থায়ী/টেম্প ইমেইল গ্রহণযোগ্য নয়। দয়া করে আপনার প্রকৃত ইমেইল ব্যবহার করুন।" };
  }
  if (SUSPICIOUS_LOCAL.test(local)) {
    return { ok: false, code: "suspicious", message: "দয়া করে আপনার প্রকৃত ইমেইল ঠিকানা প্রদান করুন।" };
  }
  return { ok: true };
}

/** Returns true if email is acceptable. Handy for zod .refine(). */
export function isAcceptableEmail(email: string): boolean {
  return checkEmail(email).ok;
}

/** Human-readable Bangla reason, or empty string if fine. */
export function emailRejectionReason(email: string): string {
  const r = checkEmail(email);
  if (r.ok === true) return "";
  return r.message;
}
