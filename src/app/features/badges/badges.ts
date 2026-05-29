import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { BADGES } from '../../data/badges';
import { GamificationService } from '../../services/gamification.service';

@Component({
  selector: 'app-badges-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="animate-float-up">
      <h1 class="text-3xl font-extrabold tracking-tight">Trophy case 🏅</h1>
      <p class="mt-1 text-slate-500 dark:text-slate-400">
        {{ earnedCount() }} of {{ total }} badges earned. Keep stacking wins!
      </p>
    </header>

    <div class="mt-4 h-2 w-full rounded-full bg-slate-200 dark:bg-white/10">
      <div class="h-full rounded-full bg-gradient-to-r from-brand-500 to-flame-500 transition-all" [style.width.%]="(earnedCount() / total) * 100"></div>
    </div>

    <section class="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      @for (b of badges; track b.id) {
        @let earned = isEarned(b.id);
        <div class="card flex flex-col items-center p-5 text-center transition" [class]="earned ? '' : 'opacity-60 grayscale'">
          <div class="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br text-3xl shadow {{ b.gradient }}">
            {{ earned ? b.icon : '🔒' }}
          </div>
          <p class="mt-3 font-bold leading-tight">{{ b.name }}</p>
          <p class="mt-1 text-xs text-slate-500">{{ b.description }}</p>
          @if (earned) { <span class="chip mt-2 bg-mint-500/15 text-mint-500">Earned</span> }
        </div>
      }
    </section>
  `,
})
export class BadgesPage {
  private gamification = inject(GamificationService);
  protected badges = BADGES;
  protected total = BADGES.length;
  protected earnedCount = this.gamification.earnedCount;
  protected earnedSet = computed(() => this.gamification.earnedBadgeIds());

  isEarned(id: string): boolean {
    return this.earnedSet().has(id);
  }
}
