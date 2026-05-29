import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { COURSES } from '../../data/curriculum';
import { ProgressService } from '../../services/progress.service';
import { LanguageId } from '../../models/curriculum.model';

@Component({
  selector: 'app-learn',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <header class="animate-float-up">
      <h1 class="text-3xl font-extrabold tracking-tight">Choose your track 📚</h1>
      <p class="mt-1 text-slate-500 dark:text-slate-400">
        Each track stacks from Beginner to Mastery. Finish a lesson to unlock the next.
      </p>
    </header>

    <section class="mt-6 grid gap-5 md:grid-cols-3">
      @for (c of courses; track c.id) {
        <a
          [routerLink]="['/learn', c.id]"
          class="card group relative overflow-hidden p-6 transition hover:-translate-y-1 hover:shadow-lg"
        >
          <div class="absolute -right-8 -top-8 h-28 w-28 rounded-full opacity-10 blur-2xl transition group-hover:opacity-20" [style.background]="c.color"></div>
          <span class="text-5xl">{{ c.icon }}</span>
          <h2 class="mt-4 text-2xl font-extrabold">{{ c.name }}</h2>
          <p class="mt-1 min-h-[3rem] text-sm text-slate-500 dark:text-slate-400">{{ c.tagline }}</p>

          <div class="mt-4 flex items-center justify-between text-sm">
            <span class="font-bold">{{ stats(c.id).completed }}/{{ stats(c.id).total }} lessons</span>
            <span class="font-bold text-slate-400">{{ pct(c.id) }}%</span>
          </div>
          <div class="mt-2 h-2 w-full rounded-full bg-slate-200 dark:bg-white/10">
            <div class="h-full rounded-full transition-all" [style.width.%]="pct(c.id)" [style.background]="c.color"></div>
          </div>

          <span class="btn-ghost mt-5 w-full justify-center group-hover:bg-brand-50 group-hover:text-brand-700 dark:group-hover:bg-brand-600/15">
            {{ stats(c.id).completed > 0 ? 'Continue' : 'Start learning' }} →
          </span>
        </a>
      }
    </section>
  `,
})
export class Learn {
  protected progress = inject(ProgressService);
  protected courses = COURSES;

  stats(lang: LanguageId) {
    return this.progress.languageProgress(lang);
  }
  pct(lang: LanguageId): number {
    return Math.round(this.stats(lang).pct * 100);
  }
}
