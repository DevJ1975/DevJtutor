import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { collection, doc, onSnapshot, setDoc } from 'firebase/firestore';
import { LessonProgress, LessonStatus } from '../models/user.model';
import { ALL_LESSONS, COURSE_BY_ID, LESSON_BY_ID } from '../data/curriculum';
import { LanguageId, Tier } from '../models/curriculum.model';
import { AuthService } from './auth.service';
import { FirebaseService } from './firebase.service';

@Injectable({ providedIn: 'root' })
export class ProgressService {
  private fb = inject(FirebaseService);
  private auth = inject(AuthService);

  /** Map of lessonId -> progress record. */
  readonly progress = signal<Record<string, LessonProgress>>({});

  readonly completedIds = computed(
    () => new Set(Object.values(this.progress()).filter((p) => p.status === 'completed').map((p) => p.lessonId)),
  );
  readonly completedCount = computed(() => this.completedIds().size);

  private unsub: (() => void) | null = null;

  constructor() {
    effect(() => {
      const user = this.auth.user();
      this.unsub?.();
      this.unsub = null;
      if (!user) {
        this.progress.set({});
        return;
      }
      const col = collection(this.fb.db, 'users', user.uid, 'progress');
      this.unsub = onSnapshot(col, (snap) => {
        const map: Record<string, LessonProgress> = {};
        snap.forEach((d) => (map[d.id] = d.data() as LessonProgress));
        this.progress.set(map);
      });
    });
  }

  statusOf(lessonId: string): LessonStatus {
    const rec = this.progress()[lessonId];
    if (rec?.status === 'completed') return 'completed';
    const lesson = LESSON_BY_ID.get(lessonId);
    if (!lesson) return 'locked';
    const done = this.completedIds();
    const unlocked = lesson.prerequisites.every((p) => done.has(p));
    return unlocked ? 'available' : 'locked';
  }

  recordOf(lessonId: string): LessonProgress | undefined {
    return this.progress()[lessonId];
  }

  /** Persist a completion (or attempt). Returns true if this is the first completion. */
  async saveCompletion(
    lessonId: string,
    score: number,
    exercisePassed: boolean,
  ): Promise<{ firstTime: boolean }> {
    const user = this.auth.user();
    if (!user) return { firstTime: false };
    const existing = this.progress()[lessonId];
    const firstTime = existing?.status !== 'completed';
    const record: LessonProgress = {
      lessonId,
      status: 'completed',
      bestScore: Math.max(existing?.bestScore ?? 0, score),
      attempts: (existing?.attempts ?? 0) + 1,
      exercisePassed: exercisePassed || (existing?.exercisePassed ?? false),
      completedAt: existing?.completedAt ?? Date.now(),
    };
    await setDoc(doc(this.fb.db, 'users', user.uid, 'progress', lessonId), record);
    return { firstTime };
  }

  // ── Derived stats for dashboards ──────────────────────────────
  languageProgress(lang: LanguageId): { completed: number; total: number; pct: number } {
    const lessons = ALL_LESSONS.filter((l) => l.language === lang);
    const done = this.completedIds();
    const completed = lessons.filter((l) => done.has(l.id)).length;
    const total = lessons.length;
    return { completed, total, pct: total ? completed / total : 0 };
  }

  tierComplete(lang: LanguageId, tier: Tier): boolean {
    const lessons = (COURSE_BY_ID.get(lang)?.modules ?? [])
      .flatMap((m) => m.lessons)
      .filter((l) => l.tier === tier);
    if (!lessons.length) return false;
    const done = this.completedIds();
    return lessons.every((l) => done.has(l.id));
  }

  hasStartedLanguage(lang: LanguageId): boolean {
    const done = this.completedIds();
    return ALL_LESSONS.some((l) => l.language === lang && done.has(l.id));
  }
}
