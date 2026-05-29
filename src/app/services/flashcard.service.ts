import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { collection, doc, onSnapshot, setDoc } from 'firebase/firestore';
import { CardReview } from '../models/user.model';
import { ALL_LESSONS } from '../data/curriculum';
import { AuthService } from './auth.service';
import { FirebaseService } from './firebase.service';
import { addDaysIso, clamp, daysBetween, todayIso } from './util';
import { lsGet, lsSet } from './local-store';

export type ReviewGrade = 'again' | 'hard' | 'good' | 'easy';
const GRADE_Q: Record<ReviewGrade, number> = { again: 2, hard: 3, good: 4, easy: 5 };

export interface DueCard {
  key: string;
  lessonId: string;
  language: string;
  front: string;
  back: string;
  review: CardReview | null; // null = brand new
}

/** Every flashcard in the curriculum, keyed `lessonId:cardId`. */
const CATALOG: DueCard[] = ALL_LESSONS.flatMap((l) =>
  l.flashcards.map((c) => ({
    key: `${l.id}:${c.id}`,
    lessonId: l.id,
    language: l.language,
    front: c.front,
    back: c.back,
    review: null,
  })),
);

const NEW_PER_SESSION = 15;

@Injectable({ providedIn: 'root' })
export class FlashcardService {
  private fb = inject(FirebaseService);
  private auth = inject(AuthService);

  readonly reviews = signal<Record<string, CardReview>>({});
  private unsub: (() => void) | null = null;

  readonly dueCount = computed(() => this.buildQueue().length);

  constructor() {
    effect(() => {
      const user = this.auth.user();
      this.unsub?.();
      this.unsub = null;
      if (!user) {
        this.reviews.set({});
        return;
      }
      if (this.auth.localGuest()) {
        this.reviews.set(lsGet<Record<string, CardReview>>('flashcards', {}));
        return;
      }
      const col = collection(this.fb.db, 'users', user.uid, 'flashcards');
      this.unsub = onSnapshot(col, (snap) => {
        const map: Record<string, CardReview> = {};
        snap.forEach((d) => (map[d.id] = d.data() as CardReview));
        this.reviews.set(map);
      });
    });
  }

  /** Cards due today (overdue/scheduled) plus a capped batch of new ones. */
  buildQueue(): DueCard[] {
    const today = todayIso();
    const reviews = this.reviews();
    const due: DueCard[] = [];
    const fresh: DueCard[] = [];
    for (const card of CATALOG) {
      const r = reviews[card.key];
      if (r) {
        if (r.dueDate <= today) due.push({ ...card, review: r });
      } else {
        fresh.push(card);
      }
    }
    return [...due, ...fresh.slice(0, NEW_PER_SESSION)];
  }

  totalLearned(): number {
    return Object.keys(this.reviews()).length;
  }

  /** Apply the SM-2 algorithm for one grade and persist the new schedule. */
  async grade(card: DueCard, grade: ReviewGrade): Promise<void> {
    const user = this.auth.user();
    if (!user) return;
    const q = GRADE_Q[grade];
    const prev = card.review;

    let ease = prev?.ease ?? 2.5;
    let reps = prev?.reps ?? 0;
    let interval = prev?.interval ?? 0;

    if (q < 3) {
      reps = 0;
      interval = 1;
    } else {
      reps += 1;
      interval = reps === 1 ? 1 : reps === 2 ? 6 : Math.round(interval * ease);
    }
    ease = clamp(ease + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02)), 1.3, 3.0);

    const today = todayIso();
    const next: CardReview = {
      cardId: card.key,
      lessonId: card.lessonId,
      language: card.language,
      front: card.front,
      back: card.back,
      ease,
      interval,
      reps,
      dueDate: addDaysIso(today, interval),
      lastReviewed: today,
    };
    if (this.auth.localGuest()) {
      const map = { ...this.reviews(), [card.key]: next };
      this.reviews.set(map);
      lsSet('flashcards', map);
      return;
    }
    await setDoc(doc(this.fb.db, 'users', user.uid, 'flashcards', card.key), next);
  }

  /** How "overdue" the SR deck is, for a friendly dashboard nudge. */
  overdueDays(): number {
    const today = todayIso();
    let max = 0;
    for (const r of Object.values(this.reviews())) {
      if (r.dueDate < today) max = Math.max(max, daysBetween(r.dueDate, today));
    }
    return max;
  }
}
