import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DueCard, FlashcardService, ReviewGrade } from '../../services/flashcard.service';
import { GamificationService } from '../../services/gamification.service';
import { UserService } from '../../services/user.service';
import { CelebrationService } from '../../shared/celebration.service';
import { COURSE_BY_ID } from '../../data/curriculum';
import { LanguageId } from '../../models/curriculum.model';
import { MarkdownPipe } from '../../shared/markdown.pipe';

@Component({
  selector: 'app-flashcards',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, MarkdownPipe],
  template: `
    <header class="animate-float-up">
      <h1 class="text-3xl font-extrabold tracking-tight">Flashcards 🃏</h1>
      <p class="mt-1 text-slate-500 dark:text-slate-400">Smart spaced repetition — review just what you’re about to forget.</p>
    </header>

    @if (!started()) {
      <div class="card mt-6 p-8 text-center">
        @if (queue().length) {
          <p class="text-5xl">🧠</p>
          <p class="mt-3 text-xl font-bold">{{ queue().length }} cards ready</p>
          <p class="mt-1 text-slate-500">A quick session keeps your knowledge sharp. +5 XP per card.</p>
          <button class="btn-primary mt-5" (click)="start()">Start review →</button>
        } @else {
          <p class="text-5xl">✅</p>
          <p class="mt-3 text-xl font-bold">You’re all caught up, {{ name() }}!</p>
          <p class="mt-1 text-slate-500">New cards unlock as you complete lessons.</p>
          <a routerLink="/learn" class="btn-primary mt-5">Learn something new →</a>
        }
      </div>
    } @else if (!finished()) {
      @let card = queue()[pos()];
      <div class="mt-6">
        <div class="mb-3 flex items-center justify-between text-sm font-semibold text-slate-400">
          <span>{{ pos() + 1 }} / {{ queue().length }}</span>
          <span class="chip" [style.background]="langColor(card.language) + '22'" [style.color]="langColor(card.language)">
            {{ langIcon(card.language) }} {{ langName(card.language) }}
          </span>
        </div>
        <div class="h-1.5 w-full rounded-full bg-slate-200 dark:bg-white/10">
          <div class="h-full rounded-full bg-brand-500 transition-all" [style.width.%]="(pos() / queue().length) * 100"></div>
        </div>

        <div class="card mt-4 flex min-h-64 cursor-pointer flex-col items-center justify-center p-8 text-center" (click)="reveal.set(true)">
          <p class="text-xs font-semibold uppercase tracking-widest text-slate-400">{{ reveal() ? 'Answer' : 'Question' }}</p>
          <div class="md mt-3 text-xl font-semibold" [innerHTML]="(reveal() ? card.back : card.front) | markdown"></div>
          @if (!reveal()) { <p class="mt-6 text-sm text-slate-400">Tap to reveal</p> }
        </div>

        @if (reveal()) {
          <div class="mt-4 grid grid-cols-4 gap-2 animate-float-up">
            <button class="btn bg-rose-500/15 text-rose-500 hover:bg-rose-500/25" (click)="grade('again')">Again</button>
            <button class="btn bg-sun-400/20 text-sun-500 hover:bg-sun-400/30" (click)="grade('hard')">Hard</button>
            <button class="btn bg-brand-500/15 text-brand-600 hover:bg-brand-500/25" (click)="grade('good')">Good</button>
            <button class="btn bg-mint-500/15 text-mint-500 hover:bg-mint-500/25" (click)="grade('easy')">Easy</button>
          </div>
        } @else {
          <button class="btn-primary mt-4 w-full" (click)="reveal.set(true)">Show answer</button>
        }
      </div>
    } @else {
      <div class="card mt-6 p-8 text-center">
        <p class="text-5xl">🎉</p>
        <p class="mt-3 text-xl font-bold">Session complete!</p>
        <p class="mt-1 text-slate-500">You reviewed {{ queue().length }} cards. Your future self thanks you, {{ name() }}.</p>
        <div class="mt-5 flex justify-center gap-2">
          <a routerLink="/dashboard" class="btn-ghost">Dashboard</a>
          <button class="btn-primary" (click)="restart()">Review more</button>
        </div>
      </div>
    }
  `,
})
export class Flashcards {
  protected cards = inject(FlashcardService);
  private gamification = inject(GamificationService);
  private users = inject(UserService);
  private celebrate = inject(CelebrationService);

  protected name = computed(() => this.users.firstName());
  protected queue = signal<DueCard[]>([]);
  protected pos = signal(0);
  protected reveal = signal(false);
  protected started = signal(false);
  protected finished = signal(false);

  start(): void {
    this.queue.set(this.cards.buildQueue());
    this.pos.set(0);
    this.reveal.set(false);
    this.finished.set(false);
    this.started.set(true);
  }

  restart(): void {
    this.started.set(false);
    this.finished.set(false);
  }

  async grade(grade: ReviewGrade): Promise<void> {
    const card = this.queue()[this.pos()];
    if (!card) return;
    await this.cards.grade(card, grade);
    if (this.pos() + 1 >= this.queue().length) {
      this.finished.set(true);
      const result = await this.gamification.recordFlashcardReviews(this.queue().length);
      this.celebrate.celebrate(result, this.users.firstName());
    } else {
      this.pos.update((p) => p + 1);
      this.reveal.set(false);
    }
  }

  langColor(l: string): string {
    return COURSE_BY_ID.get(l as LanguageId)?.color ?? '#6366f1';
  }
  langIcon(l: string): string {
    return COURSE_BY_ID.get(l as LanguageId)?.icon ?? '📘';
  }
  langName(l: string): string {
    return COURSE_BY_ID.get(l as LanguageId)?.name ?? l;
  }
}
