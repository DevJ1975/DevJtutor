import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RunnerKind } from '../../models/curriculum.model';
import { CodeEditor } from '../../shared/code-editor';

const STARTERS: Record<RunnerKind, string> = {
  js: `// JavaScript sandbox — runs in a secure web worker.\nconst nums = [1, 2, 3, 4, 5];\nconst doubled = nums.map(n => n * 2);\nconsole.log("Doubled:", doubled);\nconsole.log("Sum:", nums.reduce((a, b) => a + b, 0));`,
  python: `# Python sandbox — powered by Pyodide.\nnums = [1, 2, 3, 4, 5]\nprint("Squares:", [n*n for n in nums])\nprint("Sum:", sum(nums))`,
  sql: `-- SQL sandbox — powered by sql.js (SQLite).\nCREATE TABLE pets (id INTEGER, name TEXT, kind TEXT);\nINSERT INTO pets VALUES (1,'Rex','dog'),(2,'Milo','cat'),(3,'Sky','bird');\nSELECT kind, COUNT(*) AS total FROM pets GROUP BY kind;`,
};

@Component({
  selector: 'app-playground-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CodeEditor],
  template: `
    <header class="animate-float-up">
      <h1 class="text-3xl font-extrabold tracking-tight">Playground 🧪</h1>
      <p class="mt-1 text-slate-500 dark:text-slate-400">Tinker freely. Run JavaScript, Python, or SQL right in your browser.</p>
    </header>

    <div class="mt-5 inline-flex rounded-xl bg-slate-100 p-1 dark:bg-white/10">
      @for (lang of langs; track lang.id) {
        <button
          class="rounded-lg px-4 py-2 text-sm font-bold transition"
          [class]="runner() === lang.id ? 'bg-white shadow text-slate-900 dark:bg-slate-800 dark:text-white' : 'text-slate-500'"
          (click)="switch(lang.id)"
        >
          {{ lang.icon }} {{ lang.label }}
        </button>
      }
    </div>

    <div class="mt-4">
      <app-code-editor [runner]="runner()" [(code)]="code" />
    </div>

    <p class="mt-3 text-sm text-slate-400">
      💡 Tip: Python and SQL load their runtimes on first run (a few seconds), then they’re instant.
    </p>
  `,
})
export class PlaygroundPage {
  protected langs = [
    { id: 'js' as RunnerKind, label: 'JavaScript', icon: '🟨' },
    { id: 'python' as RunnerKind, label: 'Python', icon: '🐍' },
    { id: 'sql' as RunnerKind, label: 'SQL', icon: '🗄️' },
  ];
  protected runner = signal<RunnerKind>('js');
  protected code = signal<string>(STARTERS.js);

  switch(lang: RunnerKind): void {
    this.runner.set(lang);
    this.code.set(STARTERS[lang]);
  }
}
