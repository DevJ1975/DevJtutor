import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { doc, getDoc, onSnapshot, setDoc, updateDoc } from 'firebase/firestore';
import { Theme, UserProfile } from '../models/user.model';
import { AuthService } from './auth.service';
import { FirebaseService } from './firebase.service';
import { levelProgress, todayIso } from './util';

const DEFAULT_GOAL = 100;

@Injectable({ providedIn: 'root' })
export class UserService {
  private fb = inject(FirebaseService);
  private auth = inject(AuthService);

  readonly profile = signal<UserProfile | null>(null);
  readonly loading = signal(true);

  /** First name for greetings/affirmations. */
  readonly firstName = computed(() => {
    const p = this.profile();
    const n = p?.displayName?.trim();
    return n ? n.split(/\s+/)[0] : 'there';
  });

  readonly level = computed(() => levelProgress(this.profile()?.xp ?? 0));

  readonly theme = computed<Theme>(() => this.profile()?.settings.theme ?? this.currentDomTheme());

  private unsub: (() => void) | null = null;

  constructor() {
    effect(() => {
      const user = this.auth.user();
      // tear down previous listener
      this.unsub?.();
      this.unsub = null;

      if (!user) {
        this.profile.set(null);
        this.loading.set(false);
        return;
      }
      this.loading.set(true);
      void this.ensureProfile(user.uid, user.displayName, user.email, user.photoURL);
    });

    // Keep the DOM theme in sync with the profile setting.
    effect(() => {
      const t = this.profile()?.settings.theme;
      if (t) this.applyTheme(t);
    });
  }

  private async ensureProfile(
    uid: string,
    displayName: string | null,
    email: string | null,
    photoURL: string | null,
  ): Promise<void> {
    const ref = doc(this.fb.db, 'users', uid);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      const fresh: UserProfile = {
        uid,
        displayName: displayName ?? (email ? email.split('@')[0] : 'Learner'),
        email: email ?? '',
        photoURL: photoURL ?? undefined,
        xp: 0,
        level: 1,
        currentStreak: 0,
        longestStreak: 0,
        lastActiveDate: '',
        dailyXp: {},
        cardsReviewed: 0,
        settings: { theme: this.currentDomTheme(), dailyGoalXp: DEFAULT_GOAL, soundOn: true },
        createdAt: Date.now(),
      };
      await setDoc(ref, fresh);
    }
    // Live subscription so XP/badges/streak update reactively across the app.
    this.unsub = onSnapshot(ref, (s) => {
      if (s.exists()) this.profile.set(s.data() as UserProfile);
      this.loading.set(false);
    });
  }

  /** XP the learner has earned *today* (for the daily goal ring). */
  todayXp(): number {
    const p = this.profile();
    return p ? p.dailyXp[todayIso()] ?? 0 : 0;
  }

  async patch(partial: Partial<UserProfile>): Promise<void> {
    const p = this.profile();
    if (!p) return;
    await updateDoc(doc(this.fb.db, 'users', p.uid), partial as Record<string, unknown>);
  }

  async setTheme(theme: Theme): Promise<void> {
    this.applyTheme(theme);
    const p = this.profile();
    if (p) await this.patch({ settings: { ...p.settings, theme } });
  }

  async toggleTheme(): Promise<void> {
    await this.setTheme(this.theme() === 'dark' ? 'light' : 'dark');
  }

  async setDailyGoal(goal: number): Promise<void> {
    const p = this.profile();
    if (p) await this.patch({ settings: { ...p.settings, dailyGoalXp: goal } });
  }

  private currentDomTheme(): Theme {
    return typeof document !== 'undefined' && document.documentElement.classList.contains('dark')
      ? 'dark'
      : 'light';
  }

  private applyTheme(theme: Theme): void {
    if (typeof document === 'undefined') return;
    document.documentElement.classList.toggle('dark', theme === 'dark');
    try {
      localStorage.setItem('devj-theme', theme);
    } catch {
      /* ignore */
    }
  }
}
