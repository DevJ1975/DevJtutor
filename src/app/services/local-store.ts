/**
 * Tiny localStorage helper used by the offline "local guest" fallback, so the
 * app works (and saves progress on-device) even when Firebase auth isn't
 * available. Keys are namespaced under `devj:`.
 */
export const LOCAL_GUEST_UID = 'local-guest';

export function lsGet<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(`devj:${key}`);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function lsSet(key: string, value: unknown): void {
  try {
    localStorage.setItem(`devj:${key}`, JSON.stringify(value));
  } catch {
    /* ignore quota / privacy-mode errors */
  }
}
