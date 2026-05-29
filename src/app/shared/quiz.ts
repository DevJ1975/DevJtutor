import { ChangeDetectionStrategy, Component, computed, inject, input, output, signal } from '@angular/core';
import { QuizQuestion } from '../models/curriculum.model';
import { AffirmationService } from '../services/affirmation.service';
import { UserService } from '../services/user.service';
import { MarkdownPipe } from './markdown.pipe';

@Component({
  selector: 'app-quiz',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MarkdownPipe],
  template: `
    @let q = questions()[index()];
    @if (q) {
      <div>
        <div class="mb-3 flex items-center justify-between text-sm font-semibold text-slate-400">
          <span>Question {{ index() + 1 }} of {{ questions().length }}</span>
          <span>Score: {{ correct() }}</span>
        </div>
        <div class="h-1.5 w-full rounded-full bg-slate-200 dark:bg-white/10">
          <div class="h-full rounded-full bg-brand-500 transition-all" [style.width.%]="((index()) / questions().length) * 100"></div>
        </div>

        <h3 class="mt-5 text-lg font-bold" [innerHTML]="q.prompt | markdown"></h3>
        @if (q.code) {
          <pre class="mt-3 overflow-x-auto rounded-xl bg-slate-950 p-3 font-mono text-sm text-slate-100">{{ q.code }}</pre>
        }

        <div class="mt-4 space-y-2">
          @for (opt of q.options; track $index) {
            <button
              class="flex w-full items-center gap-3 rounded-xl border p-3 text-left font-medium transition"
              [class]="optionClass($index)"
              [disabled]="answered()"
              (click)="select($index)"
            >
              <span class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-bold">{{ letter($index) }}</span>
              <span>{{ opt }}</span>
              @if (answered() && $index === q.answer) { <span class="ml-auto">✅</span> }
              @if (answered() && $index === selected() && $index !== q.answer) { <span class="ml-auto">❌</span> }
            </button>
          }
        </div>

        @if (answered()) {
          <div class="mt-4 animate-float-up rounded-xl p-4" [class]="selected() === q.answer ? 'bg-mint-500/10' : 'bg-sun-400/10'">
            <p class="font-bold">{{ feedback() }}</p>
            <p class="mt-1 text-sm text-slate-600 dark:text-slate-300">{{ q.explanation }}</p>
          </div>
          <button class="btn-primary mt-4 w-full" (click)="next()">
            {{ isLast() ? 'Finish quiz' : 'Next question →' }}
          </button>
        }
      </div>
    }
  `,
})
export class Quiz {
  private affirm = inject(AffirmationService);
  private users = inject(UserService);

  readonly questions = input.required<QuizQuestion[]>();
  /** Emits the final score percentage (0-100). */
  readonly completed = output<number>();

  protected index = signal(0);
  protected selected = signal<number | null>(null);
  protected answered = signal(false);
  protected correct = signal(0);
  protected feedback = signal('');

  protected isLast = computed(() => this.index() === this.questions().length - 1);

  letter(i: number): string {
    return ['A', 'B', 'C', 'D', 'E'][i] ?? '?';
  }

  select(i: number): void {
    if (this.answered()) return;
    this.selected.set(i);
    this.answered.set(true);
    const right = i === this.questions()[this.index()].answer;
    const name = this.users.firstName();
    if (right) {
      this.correct.update((c) => c + 1);
      this.feedback.set(this.affirm.quizPraise(name));
    } else {
      this.feedback.set(this.affirm.quizEncourage(name));
    }
  }

  next(): void {
    if (this.isLast()) {
      const pct = Math.round((this.correct() / this.questions().length) * 100);
      this.completed.emit(pct);
      return;
    }
    this.index.update((i) => i + 1);
    this.selected.set(null);
    this.answered.set(false);
  }

  optionClass(i: number): string {
    if (!this.answered()) return 'border-slate-200 hover:border-brand-400 hover:bg-brand-50 dark:border-white/10 dark:hover:bg-white/5';
    const q = this.questions()[this.index()];
    if (i === q.answer) return 'border-mint-500 bg-mint-500/10';
    if (i === this.selected()) return 'border-rose-400 bg-rose-500/10';
    return 'border-slate-200 opacity-60 dark:border-white/10';
  }
}
