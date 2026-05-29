import { ChangeDetectionStrategy, Component, inject, input, model, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Exercise, RunnerKind } from '../models/curriculum.model';
import { GradeOutcome, PlaygroundService, TestResult } from '../services/playground.service';
import { FirebaseService } from '../services/firebase.service';

@Component({
  selector: 'app-code-editor',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule],
  template: `
    <div class="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 text-slate-100 shadow-lg">
      <div class="flex items-center justify-between border-b border-white/10 px-4 py-2">
        <div class="flex items-center gap-1.5">
          <span class="h-3 w-3 rounded-full bg-rose-500"></span>
          <span class="h-3 w-3 rounded-full bg-sun-400"></span>
          <span class="h-3 w-3 rounded-full bg-mint-500"></span>
          <span class="ml-3 text-xs font-semibold uppercase tracking-wide text-slate-400">{{ label() }}</span>
        </div>
        <div class="flex gap-2">
          <button class="rounded-lg px-3 py-1 text-xs font-semibold text-slate-300 hover:bg-white/10" (click)="reset()">Reset</button>
          <button class="rounded-lg bg-white/10 px-3 py-1 text-xs font-semibold hover:bg-white/20" (click)="run()" [disabled]="busy()">▶ Run</button>
          @if (exercise()) {
            <button class="rounded-lg bg-brand-600 px-3 py-1 text-xs font-semibold hover:bg-brand-700" (click)="check()" [disabled]="busy()">✓ Check</button>
          }
        </div>
      </div>

      <textarea
        class="block h-56 w-full resize-y bg-transparent p-4 font-mono text-sm leading-relaxed text-slate-100 outline-none"
        spellcheck="false"
        [(ngModel)]="code"
        (keydown)="onKey($event)"
      ></textarea>

      @if (busy()) {
        <div class="border-t border-white/10 px-4 py-3 text-sm text-slate-300">
          {{ playground.loadingRuntime() ? 'Booting ' + playground.loadingRuntime() + ' runtime… (first run only)' : 'Running…' }}
        </div>
      } @else if (showOutput()) {
        <div class="border-t border-white/10">
          @if (error()) {
            <pre class="overflow-x-auto px-4 py-3 font-mono text-sm text-rose-300 whitespace-pre-wrap">{{ error() }}</pre>
          } @else {
            <pre class="overflow-x-auto px-4 py-3 font-mono text-sm text-slate-200 whitespace-pre-wrap">{{ output() || '(no output)' }}</pre>
          }
          @if (tests().length) {
            <div class="space-y-1 border-t border-white/10 px-4 py-3">
              @for (t of tests(); track t.name) {
                <p class="flex items-center gap-2 text-sm" [class]="t.passed ? 'text-mint-400' : 'text-rose-300'">
                  <span>{{ t.passed ? '✅' : '❌' }}</span> {{ t.name }}
                </p>
              }
            </div>
          }
        </div>
      }
    </div>
  `,
})
export class CodeEditor {
  protected playground = inject(PlaygroundService);
  private fb = inject(FirebaseService);

  readonly runner = input.required<RunnerKind>();
  readonly exercise = input<Exercise | null>(null);
  readonly code = model<string>('');
  /** Emits true once all tests pass. */
  readonly passed = output<boolean>();

  protected busy = signal(false);
  protected output = signal('');
  protected error = signal<string | undefined>(undefined);
  protected tests = signal<TestResult[]>([]);
  protected showOutput = signal(false);

  label(): string {
    return { js: 'JavaScript', python: 'Python', sql: 'SQL' }[this.runner()];
  }

  reset(): void {
    this.code.set(this.exercise()?.starterCode ?? '');
    this.showOutput.set(false);
    this.tests.set([]);
  }

  onKey(e: KeyboardEvent): void {
    if (e.key === 'Tab') {
      e.preventDefault();
      const ta = e.target as HTMLTextAreaElement;
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      const v = this.code();
      this.code.set(v.slice(0, start) + '  ' + v.slice(end));
      queueMicrotask(() => (ta.selectionStart = ta.selectionEnd = start + 2));
    }
  }

  async run(): Promise<void> {
    this.busy.set(true);
    this.tests.set([]);
    this.fb.track('code_run', { runner: this.runner() });
    try {
      const res = await this.playground.run(this.runner(), this.code(), this.exercise()?.setupSql);
      this.output.set(res.output);
      this.error.set(res.error);
    } finally {
      this.busy.set(false);
      this.showOutput.set(true);
    }
  }

  async check(): Promise<void> {
    const ex = this.exercise();
    if (!ex) return;
    this.busy.set(true);
    this.fb.track('exercise_check', { runner: this.runner() });
    try {
      const res: GradeOutcome = await this.playground.grade(ex, this.code());
      this.output.set(res.output);
      this.error.set(res.error);
      this.tests.set(res.tests);
      if (res.passed) this.passed.emit(true);
    } finally {
      this.busy.set(false);
      this.showOutput.set(true);
    }
  }
}
