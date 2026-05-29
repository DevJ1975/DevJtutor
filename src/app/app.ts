import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from './services/auth.service';
import { UserService } from './services/user.service';
import { GamificationService } from './services/gamification.service';
import { FlashcardService } from './services/flashcard.service';
import { CelebrationHost } from './shared/celebration-host';

interface NavItem {
  path: string;
  label: string;
  icon: string;
}

@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CelebrationHost],
  template: `
    <app-celebration-host />

    @if (auth.isAuthenticated()) {
      <div class="min-h-dvh md:flex">
        <!-- Sidebar (desktop) -->
        <aside
          class="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-r border-slate-200/70 bg-white/70 p-4 backdrop-blur dark:border-white/10 dark:bg-slate-900/60 md:flex"
        >
          <a routerLink="/dashboard" class="mb-6 flex items-center gap-2 px-2">
            <span class="text-2xl">⚡</span>
            <span class="text-lg font-extrabold tracking-tight">DevJ<span class="gradient-text">Tutor</span></span>
          </a>

          <nav class="flex flex-1 flex-col gap-1">
            @for (item of nav; track item.path) {
              <a
                [routerLink]="item.path"
                routerLinkActive="bg-brand-50 text-brand-700 dark:bg-brand-600/15 dark:text-brand-300"
                class="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/5"
              >
                <span class="text-lg">{{ item.icon }}</span>
                <span>{{ item.label }}</span>
                @if (item.path === '/flashcards' && cards.dueCount() > 0) {
                  <span class="ml-auto chip bg-flame-500 text-white">{{ cards.dueCount() }}</span>
                }
              </a>
            }
          </nav>

          <button class="btn-ghost mt-2 justify-start" (click)="users.toggleTheme()">
            <span class="text-lg">{{ users.theme() === 'dark' ? '☀️' : '🌙' }}</span>
            {{ users.theme() === 'dark' ? 'Light mode' : 'Dark mode' }}
          </button>
          <a routerLink="/profile" class="mt-2 flex items-center gap-3 rounded-xl border border-slate-200/70 p-2 dark:border-white/10">
            <div class="flex h-9 w-9 items-center justify-center rounded-full bg-brand-600 text-sm font-bold text-white">
              {{ initial() }}
            </div>
            <div class="min-w-0">
              <p class="truncate text-sm font-bold">{{ users.firstName() }}</p>
              <p class="text-xs text-slate-500">Lv {{ users.level().level }} · 🔥 {{ users.profile()?.currentStreak ?? 0 }}</p>
            </div>
          </a>
        </aside>

        <!-- Main column -->
        <div class="flex min-w-0 flex-1 flex-col">
          <!-- Mobile top bar -->
          <header class="sticky top-0 z-40 flex items-center justify-between border-b border-slate-200/70 bg-white/80 px-4 py-3 backdrop-blur dark:border-white/10 dark:bg-slate-900/70 md:hidden">
            <a routerLink="/dashboard" class="flex items-center gap-1.5 font-extrabold">
              <span class="text-xl">⚡</span> DevJ<span class="gradient-text">Tutor</span>
            </a>
            <div class="flex items-center gap-3 text-sm font-bold">
              <span title="Streak">🔥 {{ users.profile()?.currentStreak ?? 0 }}</span>
              <button (click)="users.toggleTheme()" class="text-lg">{{ users.theme() === 'dark' ? '☀️' : '🌙' }}</button>
            </div>
          </header>

          <main class="mx-auto w-full max-w-5xl flex-1 px-4 py-6 pb-24 md:px-8 md:pb-10">
            <router-outlet />
          </main>

          <!-- Bottom nav (mobile) -->
          <nav class="fixed inset-x-0 bottom-0 z-40 flex justify-around border-t border-slate-200/70 bg-white/90 px-1 py-1.5 backdrop-blur dark:border-white/10 dark:bg-slate-900/85 md:hidden">
            @for (item of nav; track item.path) {
              <a
                [routerLink]="item.path"
                routerLinkActive="text-brand-600 dark:text-brand-300"
                class="relative flex flex-col items-center gap-0.5 rounded-lg px-2.5 py-1 text-[10px] font-semibold text-slate-500"
              >
                <span class="text-xl">{{ item.icon }}</span>
                {{ item.label }}
                @if (item.path === '/flashcards' && cards.dueCount() > 0) {
                  <span class="absolute right-1 top-0 h-2 w-2 rounded-full bg-flame-500"></span>
                }
              </a>
            }
          </nav>
        </div>
      </div>
    } @else {
      <router-outlet />
    }
  `,
})
export class App {
  protected auth = inject(AuthService);
  protected users = inject(UserService);
  protected cards = inject(FlashcardService);
  protected gamification = inject(GamificationService);

  protected readonly nav: NavItem[] = [
    { path: '/dashboard', label: 'Home', icon: '🏠' },
    { path: '/learn', label: 'Learn', icon: '📚' },
    { path: '/flashcards', label: 'Cards', icon: '🃏' },
    { path: '/playground', label: 'Code', icon: '🧪' },
    { path: '/badges', label: 'Badges', icon: '🏅' },
    { path: '/tutor', label: 'Tutor', icon: '🤖' },
  ];

  protected initial = computed(() => (this.users.firstName()[0] ?? '?').toUpperCase());
}
