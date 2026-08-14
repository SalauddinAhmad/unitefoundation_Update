// Local extras — dashboard manual entries persisted to localStorage so
// they survive reload even before the backend endpoint exists. Merged
// with API/mock data in the useDashboardData hooks.
const PREFIX = "uf_extras__";

function keyFor(bucket: string) {
  return `${PREFIX}${bucket}`;
}

export function readExtras<T>(bucket: string): T[] {
  try {
    const raw = localStorage.getItem(keyFor(bucket));
    return raw ? (JSON.parse(raw) as T[]) : [];
  } catch {
    return [];
  }
}

export function writeExtras<T>(bucket: string, list: T[]) {
  try {
    localStorage.setItem(keyFor(bucket), JSON.stringify(list));
  } catch {}
}

export function appendExtra<T>(bucket: string, item: T) {
  const list = readExtras<T>(bucket);
  list.unshift(item);
  writeExtras(bucket, list);
  window.dispatchEvent(new CustomEvent("uf-extras-changed", { detail: { bucket } }));
}

export function removeExtra<T extends { id: string }>(bucket: string, id: string) {
  const list = readExtras<T>(bucket).filter((x) => x.id !== id);
  writeExtras(bucket, list);
  window.dispatchEvent(new CustomEvent("uf-extras-changed", { detail: { bucket } }));
}

export function mergeExtras<T>(bucket: string, base: T[]): T[] {
  return [...readExtras<T>(bucket), ...base];
}

// Buckets used across the dashboard
export const EXTRAS = {
  donations: "donations",
  volunteers: "applications_volunteers",
  members: "applications_members",
  careers: "applications_careers",
  messages: "messages",
} as const;

