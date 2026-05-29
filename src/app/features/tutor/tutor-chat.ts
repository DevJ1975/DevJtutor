import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ChatMessage, TutorService } from '../../services/tutor.service';
import { UserService } from '../../services/user.service';
import { MarkdownPipe } from '../../shared/markdown.pipe';

@Component({
  selector: 'app-tutor-chat',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, MarkdownPipe],
  template: `
    <header class="animate-float-up">
      <h1 class="text-3xl font-extrabold tracking-tight">DevJ, your AI tutor 🤖</h1>
      <p class="mt-1 text-slate-500 dark:text-slate-400">Ask anything about JavaScript, Python, or SQL — beginner to mastery.</p>
    </header>

    <div class="card mt-5 flex h-[68vh] flex-col p-5">
      <div class="flex-1 space-y-4 overflow-y-auto pr-1">
        @if (!messages().length && !streaming()) {
          <div class="text-slate-500">
            <p class="font-semibold">👋 Hey {{ name() }}! What shall we explore today?</p>
            <div class="mt-3 flex flex-wrap gap-2">
              @for (s of suggestions; track s) {
                <button class="chip bg-slate-100 hover:bg-brand-50 dark:bg-white/10" (click)="send(s)">{{ s }}</button>
              }
            </div>
          </div>
        }
        @for (m of messages(); track $index) {
          <div [class]="m.role === 'user' ? 'flex justify-end' : ''">
            <div
              class="max-w-[85%] rounded-2xl px-4 py-2.5 text-sm"
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
          <div><div class="max-w-[85%] rounded-2xl bg-slate-100 px-4 py-2.5 text-sm dark:bg-white/10"><div class="md" [innerHTML]="streaming() | markdown"></div></div></div>
        }
        @if (error()) {
          <p class="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-600 dark:bg-rose-500/10">{{ error() }}</p>
        }
      </div>

      <form class="mt-4 flex gap-2" (ngSubmit)="send(draft); draft = ''">
        <input class="input" placeholder="Ask DevJ anything…" [(ngModel)]="draft" name="draft" [disabled]="loading()" />
        <button class="btn-primary" [disabled]="loading() || !draft.trim()">Send</button>
      </form>
    </div>
  `,
})
export class TutorChat {
  private tutor = inject(TutorService);
  private users = inject(UserService);

  protected name = computed(() => this.users.firstName());
  protected messages = signal<ChatMessage[]>([]);
  protected streaming = signal('');
  protected loading = signal(false);
  protected error = signal('');
  protected draft = '';

  protected suggestions = [
    'Explain closures with an analogy',
    'What is a SQL JOIN?',
    'Quiz me on Python lists',
    'Give me a daily coding challenge',
  ];

  send(text: string): void {
    if (!text.trim() || this.loading()) return;
    void this.dispatch({ role: 'user', content: text.trim() });
  }

  private async dispatch(userMsg: ChatMessage): Promise<void> {
    this.error.set('');
    this.messages.update((m) => [...m, userMsg]);
    this.loading.set(true);
    this.streaming.set('');
    try {
      const full = await this.tutor.streamChat(
        this.messages(),
        { learnerName: this.users.firstName() },
        (chunk) => this.streaming.update((s) => s + chunk),
      );
      this.messages.update((m) => [...m, { role: 'assistant', content: full }]);
    } catch (e) {
      this.error.set((e as Error).message);
    } finally {
      this.streaming.set('');
      this.loading.set(false);
    }
  }
}
