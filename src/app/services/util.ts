/** Local-date helpers (YYYY-MM-DD) so streaks respect the learner's timezone. */

export function todayIso(d = new Date()): string {
  const y = d.getFullYear();
  const m = `${d.getMonth() + 1}`.padStart(2, '0');
  const day = `${d.getDate()}`.padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function addDaysIso(iso: string, days: number): string {
  const d = new Date(iso + 'T00:00:00');
  d.setDate(d.getDate() + days);
  return todayIso(d);
}

/** Whole-day difference b - a (both ISO dates). */
export function daysBetween(a: string, b: string): number {
  const da = new Date(a + 'T00:00:00').getTime();
  const db = new Date(b + 'T00:00:00').getTime();
  return Math.round((db - da) / 86_400_000);
}

export function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

/** XP required to reach a given level. Gentle quadratic curve. */
export function xpForLevel(level: number): number {
  return Math.round(50 * level * (level + 1)); // L1=100, L2=300, L3=600...
}

export function levelForXp(xp: number): number {
  let level = 1;
  while (xp >= xpForLevel(level)) level++;
  return level;
}

/** Progress (0-1) toward the next level. */
export function levelProgress(xp: number): { level: number; into: number; needed: number; pct: number } {
  const level = levelForXp(xp);
  const prev = level > 1 ? xpForLevel(level - 1) : 0;
  const next = xpForLevel(level);
  const into = xp - prev;
  const needed = next - prev;
  return { level, into, needed, pct: clamp(into / needed, 0, 1) };
}
