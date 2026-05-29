import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { collection, doc, onSnapshot, setDoc } from 'firebase/firestore';
import { Badge, BadgeRule } from '../models/badge.model';
import { UserProfile } from '../models/user.model';
import { BADGES, BADGES_BY_ID } from '../data/badges';
import { AuthService } from './auth.service';
import { FirebaseService } from './firebase.service';
import { ProgressService } from './progress.service';
import { UserService } from './user.service';
import { addDaysIso, levelForXp, todayIso } from './util';

export interface CompletionResult {
  xpGained: number;
  leveledUp: boolean;
  newLevel: number;
  streak: number;
  streakIncreased: boolean;
  newBadges: Badge[];
}

@Injectable({ providedIn: 'root' })
export class GamificationService {
  private fb = inject(FirebaseService);
  private auth = inject(AuthService);
  private users = inject(UserService);
  private progress = inject(ProgressService);

  /** Set of badge ids the learner has earned. */
  readonly earnedBadgeIds = signal<Set<string>>(new Set());
  readonly earnedCount = computed(() => this.earnedBadgeIds().size);

  private unsub: (() => void) | null = null;

  constructor() {
    effect(() => {
      const user = this.auth.user();
      this.unsub?.();
      this.unsub = null;
      if (!user) {
        this.earnedBadgeIds.set(new Set());
        return;
      }
      const col = collection(this.fb.db, 'users', user.uid, 'badges');
      this.unsub = onSnapshot(col, (snap) => {
        const ids = new Set<string>();
        snap.forEach((d) => ids.add(d.id));
        this.earnedBadgeIds.set(ids);
      });
    });
  }

  /** Awards XP, updates the streak, recomputes level. Returns deltas. */
  private async grantXp(amount: number): Promise<Omit<CompletionResult, 'newBadges'>> {
    const p = this.users.profile();
    if (!p) return { xpGained: 0, leveledUp: false, newLevel: 1, streak: 0, streakIncreased: false };

    const today = todayIso();
    const beforeLevel = levelForXp(p.xp);
    const newXp = p.xp + amount;
    const newLevel = levelForXp(newXp);

    // Streak: only changes on the first activity of a new day.
    let streak = p.currentStreak;
    let streakIncreased = false;
    if (p.lastActiveDate !== today) {
      streak = p.lastActiveDate === addDaysIso(today, -1) ? p.currentStreak + 1 : 1;
      streakIncreased = true;
    }
    if (streak === 0) streak = 1;

    const dailyXp = { ...p.dailyXp, [today]: (p.dailyXp[today] ?? 0) + amount };

    const patch: Partial<UserProfile> = {
      xp: newXp,
      level: newLevel,
      currentStreak: streak,
      longestStreak: Math.max(p.longestStreak, streak),
      lastActiveDate: today,
      dailyXp,
    };
    await this.users.patch(patch);
    this.fb.track('earn_xp', { amount, level: newLevel });
    if (newLevel > beforeLevel) this.fb.track('level_up', { level: newLevel });
    if (streakIncreased) this.fb.track('streak_extend', { streak });

    return {
      xpGained: amount,
      leveledUp: newLevel > beforeLevel,
      newLevel,
      streak,
      streakIncreased,
    };
  }

  /** Completes a lesson end-to-end: progress, XP, streak, badges. */
  async completeLesson(
    lessonId: string,
    xp: number,
    score: number,
    exercisePassed: boolean,
  ): Promise<CompletionResult> {
    const { firstTime } = await this.progress.saveCompletion(lessonId, score, exercisePassed);
    // Only grant full XP the first time; small bonus for replays.
    const award = firstTime ? xp : Math.round(xp * 0.1);
    const base = await this.grantXp(award);
    const newBadges = await this.evaluateBadges({ perfectQuiz: score >= 100 });
    this.fb.track('lesson_complete', { lessonId, score, firstTime });
    return { ...base, newBadges };
  }

  /** Records reviewed flashcards (XP + counter + possible badge). */
  async recordFlashcardReviews(count: number, xpEach = 5): Promise<CompletionResult> {
    const p = this.users.profile();
    if (p) await this.users.patch({ cardsReviewed: (p.cardsReviewed ?? 0) + count });
    const base = await this.grantXp(count * xpEach);
    const newBadges = await this.evaluateBadges({});
    this.fb.track('flashcards_reviewed', { count });
    return { ...base, newBadges };
  }

  /** Checks every badge rule, persists any newly earned, returns the new ones. */
  async evaluateBadges(ctx: { perfectQuiz?: boolean }): Promise<Badge[]> {
    const user = this.auth.user();
    const p = this.users.profile();
    if (!user || !p) return [];
    const earned = this.earnedBadgeIds();
    const fresh: Badge[] = [];

    for (const badge of BADGES) {
      if (earned.has(badge.id)) continue;
      if (this.satisfies(badge.rule, p, ctx)) {
        await setDoc(doc(this.fb.db, 'users', user.uid, 'badges', badge.id), {
          badgeId: badge.id,
          earnedAt: Date.now(),
        });
        fresh.push(badge);
        this.fb.track('earn_badge', { badge: badge.id });
      }
    }
    return fresh;
  }

  private satisfies(rule: BadgeRule, p: UserProfile, ctx: { perfectQuiz?: boolean }): boolean {
    const completed = this.progress.completedCount();
    switch (rule.kind) {
      case 'firstLesson':
        return completed >= 1;
      case 'lessonsCompleted':
        return completed >= rule.count;
      case 'streak':
        return p.currentStreak >= rule.days;
      case 'perfectQuiz':
        return !!ctx.perfectQuiz;
      case 'xpReached':
        return p.xp >= rule.xp;
      case 'flashcardsReviewed':
        return (p.cardsReviewed ?? 0) >= rule.count;
      case 'languageStarted':
        return this.progress.hasStartedLanguage(rule.language as never);
      case 'tierMastered':
        return this.progress.tierComplete(rule.language as never, rule.tier as never);
      default:
        return false;
    }
  }

  badgeById(id: string): Badge | undefined {
    return BADGES_BY_ID.get(id);
  }
}
