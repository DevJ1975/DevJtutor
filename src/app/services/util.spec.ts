import { addDaysIso, clamp, daysBetween, levelForXp, levelProgress, todayIso, xpForLevel } from './util';

describe('util', () => {
  it('computes ISO dates and differences', () => {
    expect(addDaysIso('2026-01-01', 1)).toBe('2026-01-02');
    expect(addDaysIso('2026-03-01', -1)).toBe('2026-02-28');
    expect(daysBetween('2026-01-01', '2026-01-08')).toBe(7);
    expect(todayIso(new Date('2026-05-29T10:00:00'))).toBe('2026-05-29');
  });

  it('clamps numbers', () => {
    expect(clamp(5, 0, 10)).toBe(5);
    expect(clamp(-1, 0, 10)).toBe(0);
    expect(clamp(99, 0, 10)).toBe(10);
  });

  it('uses a rising XP-per-level curve', () => {
    expect(xpForLevel(1)).toBe(100);
    expect(xpForLevel(2)).toBe(300);
    expect(levelForXp(0)).toBe(1);
    expect(levelForXp(100)).toBe(2);
    expect(levelForXp(99)).toBe(1);
  });

  it('reports progress toward the next level', () => {
    const p = levelProgress(150);
    expect(p.level).toBe(2);
    expect(p.into).toBe(50); // 150 - 100
    expect(p.needed).toBe(200); // 300 - 100
    expect(p.pct).toBeCloseTo(0.25, 5);
  });
});
