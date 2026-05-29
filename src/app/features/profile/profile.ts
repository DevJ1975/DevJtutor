import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { ProgressService } from '../../services/progress.service';
import { GamificationService } from '../../services/gamification.service';
import { FlashcardService } from '../../services/flashcard.service';
import { addDaysIso, todayIso } from '../../services/util';

@Component({
  selector: 'app-profile',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (profile(); as p) {
      <header class="flex items-center gap-4 animate-float-up">
        <div class="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-flame-500 text-2xl font-extrabold text-white">
          {{ initial() }}
        </div>
        <div>
          <h1 class="text-3xl font-extrabold tracking-tight">{{ p.displayName }}</h1>
          <p class="text-slate-500 dark:text-slate-400">{{ p.email }}</p>
        </div>
      </header>

      <section class="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <div class="card p-4"><p class="text-xs uppercase text-slate-400">XP</p><p class="text-xl font-extrabold">⚡ {{ p.xp }}</p></div>
        <div class="card p-4"><p class="text-xs uppercase text-slate-400">Level</p><p class="text-xl font-extrabold">⭐ {{ p.level }}</p></div>
        <div class="card p-4"><p class="text-xs uppercase text-slate-400">Streak</p><p class="text-xl font-extrabold">🔥 {{ p.currentStreak }}</p></div>
        <div class="card p-4"><p class="text-xs uppercase text-slate-400">Best</p><p class="text-xl font-extrabold">🏆 {{ p.longestStreak }}</p></div>
        <div class="card p-4"><p class="text-xs uppercase text-slate-400">Lessons</p><p class="text-xl font-extrabold">📘 {{ progress.completedCount() }}</p></div>
        <div class="card p-4"><p class="text-xs uppercase text-slate-400">Badges</p><p class="text-xl font-extrabold">🏅 {{ gamification.earnedCount() }}</p></div>
      </section>

      <!-- Activity heatmap -->
      <section class="card mt-4 p-5">
        <h2 class="text-lg font-extrabold">Activity</h2>
        <p class="text-sm text-slate-500">Last 12 weeks of training.</p>
        <div class="mt-3 grid grid-flow-col grid-rows-7 gap-1">
          @for (d of heatmap(); track d.date) {
            <div class="h-3.5 w-3.5 rounded-sm" [style.background]="cellColor(d.xp)" [title]="d.date + ': ' + d.xp + ' XP'"></div>
          }
        </div>
      </section>

      <!-- Settings -->
      <section class="card mt-4 p-5">
        <h2 class="text-lg font-extrabold">Settings</h2>

        <div class="mt-4 flex items-center justify-between">
          <div>
            <p class="font-semibold">Daily XP goal</p>
            <p class="text-sm text-slate-500">How much you aim to earn each day.</p>
          </div>
          <div class="inline-flex rounded-xl bg-slate-100 p-1 dark:bg-white/10">
            @for (g of goals; track g) {
              <button
                class="rounded-lg px-3 py-1.5 text-sm font-bold transition"
                [class]="p.settings.dailyGoalXp === g ? 'bg-white shadow text-slate-900 dark:bg-slate-800 dark:text-white' : 'text-slate-500'"
                (click)="users.setDailyGoal(g)"
              >{{ g }}</button>
            }
          </div>
        </div>

        <div class="mt-4 flex items-center justify-between border-t border-slate-100 pt-4 dark:border-white/10">
          <div>
            <p class="font-semibold">Theme</p>
            <p class="text-sm text-slate-500">Light or dark — your eyes, your call.</p>
          </div>
          <button class="btn-ghost" (click)="users.toggleTheme()">
            {{ users.theme() === 'dark' ? '☀️ Light' : '🌙 Dark' }}
          </button>
        </div>

        <div class="mt-4 flex items-center justify-between border-t border-slate-100 pt-4 dark:border-white/10">
          <div>
            <p class="font-semibold">Sign out</p>
            <p class="text-sm text-slate-500">See you tomorrow — keep the streak alive!</p>
          </div>
          <button class="btn-outline" (click)="logout()">Log out</button>
        </div>
      </section>
    }
  `,
})
export class Profile {
  private auth = inject(AuthService);
  private router = inject(Router);
  protected users = inject(UserService);
  protected progress = inject(ProgressService);
  protected gamification = inject(GamificationService);
  protected cards = inject(FlashcardService);

  protected profile = this.users.profile;
  protected goals = [50, 100, 150, 200];
  protected initial = computed(() => (this.users.firstName()[0] ?? '?').toUpperCase());

  protected heatmap = computed(() => {
    const p = this.profile();
    const days: { date: string; xp: number }[] = [];
    const today = todayIso();
    for (let i = 83; i >= 0; i--) {
      const date = addDaysIso(today, -i);
      days.push({ date, xp: p?.dailyXp[date] ?? 0 });
    }
    return days;
  });

  cellColor(xp: number): string {
    if (xp <= 0) return 'rgba(100,116,139,0.15)';
    if (xp < 50) return 'rgba(99,102,241,0.35)';
    if (xp < 100) return 'rgba(99,102,241,0.6)';
    if (xp < 200) return 'rgba(99,102,241,0.85)';
    return '#4f46e5';
  }

  async logout(): Promise<void> {
    await this.auth.logout();
    await this.router.navigate(['/welcome']);
  }
}
