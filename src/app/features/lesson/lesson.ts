import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ALL_LESSONS, COURSE_BY_ID, LESSON_BY_ID } from '../../data/curriculum';
import { ProgressService } from '../../services/progress.service';
import { GamificationService } from '../../services/gamification.service';
import { UserService } from '../../services/user.service';
import { CelebrationService } from '../../shared/celebration.service';
import { ChatMessage, TutorService } from '../../services/tutor.service';
import { CodeEditor } from '../../shared/code-editor';
import { Quiz } from '../../shared/quiz';
import { MarkdownPipe } from '../../shared/markdown.pipe';

@Component({
  selector: 'app-lesson',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, FormsModule, CodeEditor, Quiz, MarkdownPipe],
  template: `
    @let l = lesson();
    @if (l) {
      <a [routerLink]="['/learn', l.language]" class="text-sm font-semibold text-slate-400 hover:text-brand-600">← {{ courseName() }} track</a>

      <header class="mt-2">
        <div class="flex flex-wrap items-center gap-2">
          <span class="chip bg-brand-50 text-brand-700 dark:bg-brand-600/15 dark:text-brand-300">{{ l.moduleTitle }}</span>
          <span class="chip bg-slate-100 text-slate-500 dark:bg-white/10 dark:text-slate-300">~{{ l.minutes }} min · +{{ l.xp }} XP</span>
          @if (completed()) { <span class="chip bg-mint-500/15 text-mint-500">Completed ✅</span> }
        </div>
        <h1 class="mt-3 text-3xl font-extrabold tracking-tight">{{ l.title }}</h1>
        <p class="mt-1 text-slate-500 dark:text-slate-400">{{ l.summary }}</p>
      </header>

      <div class="mt-6 grid gap-6 lg:grid-cols-3">
        <div class="space-y-6 lg:col-span-2">
          <!-- Learn -->
          <section class="card p-6">
            <h2 class="mb-3 flex items-center gap-2 text-lg font-extrabold">📖 Learn</h2>
            @if (l.content.trim()) {
              <div class="md" [innerHTML]="l.content | markdown"></div>
            } @else {
              <div class="rounded-xl bg-sun-400/10 p-4 text-sm">
                <p class="font-bold">✨ Full lesson coming soon!</p>
                <p class="mt-1 text-slate-600 dark:text-slate-300">
                  This lesson is on the roadmap. Ask the AI tutor on the right to teach you
                  <strong>{{ l.title }}</strong> right now, then mark it reviewed to keep your streak going.
                </p>
              </div>
            }
          </section>

          <!-- Practice -->
          @if (l.exercise) {
            <section class="card p-6">
              <h2 class="mb-2 flex items-center gap-2 text-lg font-extrabold">🧪 Practice</h2>
              <div class="md mb-3 text-sm" [innerHTML]="l.exercise.instructions | markdown"></div>
              <app-code-editor
                [runner]="l.exercise.runner"
                [exercise]="l.exercise"
                [(code)]="code"
                (passed)="onExercisePassed()"
              />
              @if (exercisePassed()) {
                <p class="mt-3 font-semibold text-mint-500">🎉 All tests pass — beautiful work!</p>
              }
            </section>
          }

          <!-- Quiz -->
          @if (l.quiz.length) {
            <section class="card p-6">
              <h2 class="mb-3 flex items-center gap-2 text-lg font-extrabold">🧠 Quiz</h2>
              @if (quizScore() === null) {
                <app-quiz [questions]="l.quiz" (completed)="onQuizDone($event)" />
              } @else {
                <div class="text-center">
                  <p class="text-5xl font-extrabold gradient-text">{{ quizScore() }}%</p>
                  <p class="mt-1 text-slate-500">{{ quizScore()! >= 80 ? 'Quiz mastered!' : 'Nice effort — review and retry anytime.' }}</p>
                  <button class="btn-ghost mt-3" (click)="retryQuiz()">Retry quiz</button>
                </div>
              }
            </section>
          }

          <!-- Complete -->
          <section class="card p-6 text-center">
            @if (!completed()) {
              <button class="btn-primary w-full text-base" [disabled]="!canComplete() || saving()" (click)="complete()">
                {{ saving() ? 'Saving…' : completeLabel() }}
              </button>
              @if (!canComplete()) {
                <p class="mt-2 text-sm text-slate-400">Finish the quiz to complete this lesson.</p>
              }
            } @else {
              <p class="text-lg font-bold">Lesson complete! 🎉</p>
              @if (nextLesson(); as n) {
                <a [routerLink]="['/learn', n.language, n.id]" class="btn-primary mt-3 w-full">Next: {{ n.title }} →</a>
              } @else {
                <a [routerLink]="['/learn', l.language]" class="btn-primary mt-3 w-full">Back to track</a>
              }
            }
          </section>
        </div>

        <!-- AI tutor helper -->
        <aside class="lg:sticky lg:top-6 lg:self-start">
          <div class="card flex max-h-[80vh] flex-col p-5">
            <h2 class="flex items-center gap-2 text-lg font-extrabold">🤖 Ask DevJ</h2>
            <p class="text-sm text-slate-500">Your AI tutor for this lesson.</p>

            <div class="mt-3 flex flex-wrap gap-2">
              <button class="chip bg-slate-100 hover:bg-brand-50 dark:bg-white/10" (click)="quick('explain')">Explain simpler</button>
              @if (l.exercise) { <button class="chip bg-slate-100 hover:bg-brand-50 dark:bg-white/10" (click)="quick('hint')">Give a hint</button> }
              @if (l.exercise) { <button class="chip bg-slate-100 hover:bg-brand-50 dark:bg-white/10" (click)="quick('review')">Review my code</button> }
              <button class="chip bg-slate-100 hover:bg-brand-50 dark:bg-white/10" (click)="quick('practice')">Practice Q</button>
            </div>

            <div class="mt-4 min-h-24 flex-1 space-y-3 overflow-y-auto">
              @if (!messages().length && !streaming()) {
                <p class="text-sm text-slate-400">👋 Hi {{ name() }}! Ask me anything about this lesson.</p>
              }
              @for (m of messages(); track $index) {
                <div [class]="m.role === 'user' ? 'text-right' : ''">
                  <div
                    class="inline-block max-w-[90%] rounded-2xl px-3 py-2 text-sm"
                    [class]="m.role === 'user' ? 'bg-brand-600 text-white' : 'bg-slate-100 dark:bg-white/10'"
                  >
                    @if (m.role === 'assistant') {
                      <div class="md" [innerHTML]="m.content | markdown"></div>
                    } @else {
                      {{ m.content }}
                    }
                  </div>
                </div>
              }
              @if (streaming()) {
                <div><div class="inline-block max-w-[90%] rounded-2xl bg-slate-100 px-3 py-2 text-sm dark:bg-white/10"><div class="md" [innerHTML]="streaming() | markdown"></div></div></div>
              }
              @if (tutorError()) {
                <p class="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-600 dark:bg-rose-500/10">{{ tutorError() }}</p>
              }
            </div>

            <form class="mt-3 flex gap-2" (ngSubmit)="send(draft); draft = ''">
              <input class="input" placeholder="Ask a question…" [(ngModel)]="draft" name="draft" [disabled]="loading()" />
              <button class="btn-primary px-3" [disabled]="loading() || !draft.trim()">→</button>
            </form>
          </div>
        </aside>
      </div>
    } @else {
      <p class="text-slate-500">Lesson not found.</p>
    }
  `,
})
export class LessonComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private progress = inject(ProgressService);
  private gamification = inject(GamificationService);
  private users = inject(UserService);
  private celebrate = inject(CelebrationService);
  private tutor = inject(TutorService);

  protected lessonId = computed(() => this.route.snapshot.paramMap.get('lessonId') ?? '');
  protected lesson = computed(() => LESSON_BY_ID.get(this.lessonId()));
  protected courseName = computed(() => COURSE_BY_ID.get(this.lesson()?.language ?? 'javascript')?.name ?? '');

  protected code = signal('');
  protected exercisePassed = signal(false);
  protected quizScore = signal<number | null>(null);
  protected saving = signal(false);
  protected completed = computed(() => this.progress.statusOf(this.lessonId()) === 'completed');

  // AI tutor state
  protected name = computed(() => this.users.firstName());
  protected messages = signal<ChatMessage[]>([]);
  protected streaming = signal('');
  protected loading = signal(false);
  protected tutorError = signal('');
  protected draft = '';

  constructor() {
    // Seed editor with starter code for the current lesson.
    const ex = this.lesson()?.exercise;
    if (ex) this.code.set(ex.starterCode);
  }

  protected canComplete = computed(() => {
    const l = this.lesson();
    if (!l) return false;
    if (l.quiz.length) return this.quizScore() !== null;
    return true; // content-only or scaffolded lessons
  });

  completeLabel(): string {
    return this.lesson()?.content.trim() || this.lesson()?.quiz.length ? 'Complete lesson 🎉' : 'Mark as reviewed ✓';
  }

  protected nextLesson = computed(() => {
    const l = this.lesson();
    if (!l) return null;
    const sameLang = ALL_LESSONS.filter((x) => x.language === l.language);
    const idx = sameLang.findIndex((x) => x.id === l.id);
    return sameLang.slice(idx + 1).find((x) => this.progress.statusOf(x.id) !== 'locked') ?? null;
  });

  onExercisePassed(): void {
    this.exercisePassed.set(true);
  }
  onQuizDone(score: number): void {
    this.quizScore.set(score);
  }
  retryQuiz(): void {
    this.quizScore.set(null);
  }

  async complete(): Promise<void> {
    const l = this.lesson();
    if (!l || this.saving()) return;
    this.saving.set(true);
    try {
      const result = await this.gamification.completeLesson(
        l.id,
        l.xp,
        this.quizScore() ?? 0,
        this.exercisePassed(),
      );
      this.celebrate.celebrate(result, this.users.firstName());
    } finally {
      this.saving.set(false);
    }
  }

  // ── AI tutor ───────────────────────────────────────────────────
  quick(kind: 'explain' | 'hint' | 'review' | 'practice'): void {
    const l = this.lesson();
    if (!l) return;
    let msg: ChatMessage;
    switch (kind) {
      case 'explain': msg = this.tutor.explainSimpler(l.title); break;
      case 'hint': msg = this.tutor.hintFor(l.exercise?.instructions ?? l.title); break;
      case 'review': msg = this.tutor.reviewCode(); break;
      case 'practice': msg = this.tutor.practiceQuestion(l.title); break;
    }
    void this.dispatch(msg);
  }

  send(text: string): void {
    if (!text.trim()) return;
    void this.dispatch({ role: 'user', content: text.trim() });
  }

  private async dispatch(userMsg: ChatMessage): Promise<void> {
    if (this.loading()) return;
    const l = this.lesson();
    this.tutorError.set('');
    this.messages.update((m) => [...m, userMsg]);
    this.loading.set(true);
    this.streaming.set('');
    try {
      const full = await this.tutor.streamChat(
        this.messages(),
        {
          learnerName: this.users.firstName(),
          language: l?.language,
          lessonTitle: l?.title,
          lessonContent: l?.content,
          code: this.code(),
        },
        (chunk) => this.streaming.update((s) => s + chunk),
      );
      this.messages.update((m) => [...m, { role: 'assistant', content: full }]);
    } catch (e) {
      this.tutorError.set((e as Error).message);
    } finally {
      this.streaming.set('');
      this.loading.set(false);
    }
  }
}
