import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { COURSE_BY_ID, TIERS, TIER_LABEL } from '../../data/curriculum';
import { LanguageId, Tier } from '../../models/curriculum.model';
import { ProgressService } from '../../services/progress.service';
import { LESSON_BY_ID } from '../../data/curriculum';

@Component({
  selector: 'app-language-path',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    @if (course(); as c) {
      <a routerLink="/learn" class="text-sm font-semibold text-slate-400 hover:text-brand-600">← All tracks</a>
      <header class="mt-2 flex items-center gap-4">
        <span class="text-5xl">{{ c.icon }}</span>
        <div>
          <h1 class="text-3xl font-extrabold tracking-tight">{{ c.name }}</h1>
          <p class="text-slate-500 dark:text-slate-400">{{ c.tagline }}</p>
        </div>
      </header>

      <div class="mt-3 h-2 w-full rounded-full bg-slate-200 dark:bg-white/10">
        <div class="h-full rounded-full transition-all" [style.width.%]="pct()" [style.background]="c.color"></div>
      </div>
      <p class="mt-1 text-sm font-semibold text-slate-400">{{ pct() }}% mastered</p>

      @for (tier of tiers; track tier) {
        @if (modulesFor(tier).length) {
          <section class="mt-8">
            <div class="mb-3 flex items-center gap-2">
              <h2 class="text-lg font-extrabold">{{ tierLabel[tier] }}</h2>
              @if (tierDone(tier)) {
                <span class="chip bg-mint-500/15 text-mint-500">Mastered 🏅</span>
              }
            </div>

            <div class="space-y-5">
              @for (m of modulesFor(tier); track m.id) {
                <div class="card p-5">
                  <h3 class="flex items-center gap-2 text-base font-bold">
                    <span class="text-xl">{{ m.icon }}</span> {{ m.title }}
                  </h3>
                  <div class="mt-4 grid gap-2 sm:grid-cols-2">
                    @for (l of m.lessons; track l.id) {
                      @let st = status(l.id);
                      @if (st === 'locked') {
                        <div class="flex items-start gap-3 rounded-xl border border-dashed border-slate-200 p-3 opacity-70 dark:border-white/10">
                          <span class="mt-0.5 text-lg">🔒</span>
                          <div class="min-w-0">
                            <p class="font-semibold">{{ l.title }}</p>
                            <p class="text-xs text-slate-400">{{ lockHint(l.prerequisites) }}</p>
                          </div>
                        </div>
                      } @else {
                        <a
                          [routerLink]="['/learn', c.id, l.id]"
                          class="flex items-start gap-3 rounded-xl border p-3 transition hover:-translate-y-0.5 hover:shadow-sm"
                          [class]="st === 'completed' ? 'border-mint-500/40 bg-mint-500/5' : 'border-slate-200 dark:border-white/10'"
                        >
                          <span class="mt-0.5 text-lg">{{ st === 'completed' ? '✅' : '▶️' }}</span>
                          <div class="min-w-0 flex-1">
                            <p class="font-semibold">{{ l.title }}</p>
                            <p class="text-xs text-slate-500">{{ l.summary }}</p>
                            <div class="mt-1 flex items-center gap-2 text-xs text-slate-400">
                              <span>~{{ l.minutes }} min</span><span>·</span><span>+{{ l.xp }} XP</span>
                              @if (st === 'completed' && best(l.id) > 0) { <span>·</span><span>{{ best(l.id) }}% quiz</span> }
                            </div>
                          </div>
                        </a>
                      }
                    }
                  </div>
                </div>
              }
            </div>
          </section>
        }
      }
    } @else {
      <p class="text-slate-500">Track not found.</p>
    }
  `,
})
export class LanguagePath {
  private route = inject(ActivatedRoute);
  protected progress = inject(ProgressService);

  protected tiers = TIERS;
  protected tierLabel = TIER_LABEL;

  protected lang = computed<LanguageId>(
    () => (this.route.snapshot.paramMap.get('lang') as LanguageId) ?? 'javascript',
  );
  protected course = computed(() => COURSE_BY_ID.get(this.lang()));
  protected pct = computed(() => Math.round(this.progress.languageProgress(this.lang()).pct * 100));

  modulesFor(tier: Tier) {
    return (this.course()?.modules ?? []).filter((m) => m.tier === tier);
  }
  status(id: string) {
    return this.progress.statusOf(id);
  }
  best(id: string): number {
    return this.progress.recordOf(id)?.bestScore ?? 0;
  }
  tierDone(tier: Tier): boolean {
    return this.progress.tierComplete(this.lang(), tier);
  }
  lockHint(prereqs: string[]): string {
    const names = prereqs.map((p) => LESSON_BY_ID.get(p)?.title ?? p);
    return names.length ? `Complete: ${names.join(', ')}` : 'Locked';
  }
}
