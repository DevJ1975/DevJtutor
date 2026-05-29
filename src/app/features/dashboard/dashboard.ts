import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AffirmationService } from '../../services/affirmation.service';
import { UserService } from '../../services/user.service';
import { ProgressService } from '../../services/progress.service';
import { FlashcardService } from '../../services/flashcard.service';
import { GamificationService } from '../../services/gamification.service';
import { ALL_LESSONS, COURSES, FlatLesson } from '../../data/curriculum';
import { BADGES_BY_ID } from '../../data/badges';

@Component({
  selector: 'app-dashboard',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <!-- Greeting -->
    <header class="animate-float-up">
      <h1 class="text-3xl font-extrabold tracking-tight">{{ greeting() }}</h1>
      <p class="mt-1 text-slate-500 dark:text-slate-400">{{ affirmation }}</p>
    </header>

    <!-- Stat row -->
    <section class="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
      <div class="card p-4">
        <p class="text-xs font-semibold uppercase tracking-wide text-slate-400">Streak</p>
        <p class="mt-1 text-2xl font-extrabold">🔥 {{ profile()?.currentStreak ?? 0 }}</p>
        <p class="text-xs text-slate-400">best {{ profile()?.longestStreak ?? 0 }}</p>
      </div>
      <div class="card p-4">
        <p class="text-xs font-semibold uppercase tracking-wide text-slate-400">Level</p>
        <p class="mt-1 text-2xl font-extrabold">⭐ {{ level().level }}</p>
        <div class="mt-2 h-1.5 w-full rounded-full bg-slate-200 dark:bg-white/10">
          <div class="h-full rounded-full bg-brand-500" [style.width.%]="level().pct * 100"></div>
        </div>
      </div>
      <div class="card p-4">
        <p class="text-xs font-semibold uppercase tracking-wide text-slate-400">Total XP</p>
        <p class="mt-1 text-2xl font-extrabold">⚡ {{ profile()?.xp ?? 0 }}</p>
      </div>
      <div class="card p-4">
        <p class="text-xs font-semibold uppercase tracking-wide text-slate-400">Lessons</p>
        <p class="mt-1 text-2xl font-extrabold">📘 {{ progress.completedCount() }}</p>
        <p class="text-xs text-slate-400">of {{ totalLessons }}</p>
      </div>
    </section>

    <div class="mt-4 grid gap-4 lg:grid-cols-3">
      <!-- Daily goal ring -->
      <div class="card flex items-center gap-4 p-5">
        <svg viewBox="0 0 120 120" class="h-24 w-24 -rotate-90">
          <circle cx="60" cy="60" r="52" fill="none" stroke="currentColor" class="text-slate-200 dark:text-white/10" stroke-width="12" />
          <circle
            cx="60" cy="60" r="52" fill="none" stroke="url(#grad)" stroke-width="12" stroke-linecap="round"
            [attr.stroke-dasharray]="circumference"
            [attr.stroke-dashoffset]="circumference * (1 - goalPct())"
          />
          <defs>
            <linearGradient id="grad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stop-color="#6366f1" /><stop offset="1" stop-color="#f97316" />
            </linearGradient>
          </defs>
        </svg>
        <div>
          <p class="text-xs font-semibold uppercase tracking-wide text-slate-400">Daily goal</p>
          <p class="text-2xl font-extrabold">{{ todayXp() }}<span class="text-base text-slate-400"> / {{ goal() }} XP</span></p>
          <p class="mt-1 text-sm text-slate-500">
            {{ goalPct() >= 1 ? 'Goal smashed! 🎉' : 'Keep going, you’ve got this 💪' }}
          </p>
        </div>
      </div>

      <!-- Continue learning -->
      <div class="card p-5 lg:col-span-2">
        <p class="text-xs font-semibold uppercase tracking-wide text-slate-400">Continue learning</p>
        @if (resume(); as r) {
          <a [routerLink]="['/learn', r.language, r.id]" class="mt-2 block rounded-xl p-3 transition hover:bg-slate-50 dark:hover:bg-white/5">
            <p class="text-lg font-bold">{{ r.title }}</p>
            <p class="text-sm text-slate-500">{{ r.moduleTitle }} · ~{{ r.minutes }} min · +{{ r.xp }} XP</p>
            <span class="btn-primary mt-3">Resume lesson →</span>
          </a>
        } @else {
          <p class="mt-2 text-slate-500">You’ve completed everything available. Legend. 👑</p>
        }
        @if (cards.dueCount() > 0) {
          <a routerLink="/flashcards" class="mt-3 flex items-center gap-2 rounded-xl bg-flame-500/10 px-3 py-2 text-sm font-semibold text-flame-500">
            🃏 {{ cards.dueCount() }} flashcards ready for review →
          </a>
        }
      </div>
    </div>

    <!-- Language tracks -->
    <h2 class="mt-8 text-xl font-extrabold">Your tracks</h2>
    <section class="mt-3 grid gap-4 sm:grid-cols-3">
      @for (c of courses; track c.id) {
        <a [routerLink]="['/learn', c.id]" class="card group p-5 transition hover:-translate-y-0.5 hover:shadow-md">
          <div class="flex items-center justify-between">
            <span class="text-3xl">{{ c.icon }}</span>
            <span class="text-sm font-bold text-slate-400">{{ pct(c.id) }}%</span>
          </div>
          <p class="mt-3 text-lg font-bold">{{ c.name }}</p>
          <div class="mt-2 h-2 w-full rounded-full bg-slate-200 dark:bg-white/10">
            <div class="h-full rounded-full" [style.width.%]="pct(c.id)" [style.background]="c.color"></div>
          </div>
        </a>
      }
    </section>

    <!-- Recent badges -->
    <div class="mt-8 flex items-center justify-between">
      <h2 class="text-xl font-extrabold">Your badges</h2>
      <a routerLink="/badges" class="text-sm font-bold text-brand-600 hover:underline">View all →</a>
    </div>
    @if (earnedBadges().length) {
      <div class="mt-3 flex flex-wrap gap-3">
        @for (b of earnedBadges(); track b.id) {
          <div class="flex flex-col items-center" [title]="b.description">
            <div class="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br text-2xl shadow {{ b.gradient }}">{{ b.icon }}</div>
            <span class="mt-1 text-xs font-semibold text-slate-500">{{ b.name }}</span>
          </div>
        }
      </div>
    } @else {
      <p class="mt-3 text-slate-500">Complete your first lesson to earn the 🌱 First Steps badge!</p>
    }
  `,
})
export class Dashboard {
  private affirm = inject(AffirmationService);
  protected users = inject(UserService);
  protected progress = inject(ProgressService);
  protected cards = inject(FlashcardService);
  protected gamification = inject(GamificationService);

  protected courses = COURSES;
  protected totalLessons = ALL_LESSONS.length;
  protected circumference = 2 * Math.PI * 52;
  protected affirmation = this.affirm.affirmation(this.users.firstName());

  protected profile = this.users.profile;
  protected level = this.users.level;
  protected greeting = computed(() => this.affirm.greeting(this.users.firstName()));
  protected todayXp = computed(() => this.users.todayXp());
  protected goal = computed(() => this.profile()?.settings.dailyGoalXp ?? 100);
  protected goalPct = computed(() => Math.min(1, this.todayXp() / this.goal()));

  protected resume = computed<FlatLesson | null>(() => {
    void this.progress.progress(); // re-evaluate on progress change
    const done = this.progress.completedIds();
    return ALL_LESSONS.find((l) => !done.has(l.id) && this.progress.statusOf(l.id) === 'available') ?? null;
  });

  protected earnedBadges = computed(() =>
    [...this.gamification.earnedBadgeIds()].map((id) => BADGES_BY_ID.get(id)!).filter(Boolean).slice(0, 8),
  );

  pct(lang: 'javascript' | 'python' | 'sql'): number {
    return Math.round(this.progress.languageProgress(lang).pct * 100);
  }
}
