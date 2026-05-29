import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-welcome',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule],
  template: `
    <div class="grid min-h-dvh lg:grid-cols-2">
      <!-- Hero -->
      <div class="relative hidden flex-col justify-between overflow-hidden bg-slate-950 p-12 text-white lg:flex">
        <div class="absolute -left-24 -top-24 h-96 w-96 rounded-full bg-brand-600/40 blur-3xl"></div>
        <div class="absolute -bottom-24 -right-16 h-96 w-96 rounded-full bg-flame-500/30 blur-3xl"></div>
        <div class="relative flex items-center gap-2 text-xl font-extrabold">
          <span class="text-2xl">⚡</span> DevJ<span class="gradient-text">Tutor</span>
        </div>
        <div class="relative">
          <h1 class="text-4xl font-extrabold leading-tight">
            Your daily path to <span class="gradient-text">mastery</span> in JavaScript, Python & SQL.
          </h1>
          <p class="mt-4 max-w-md text-slate-300">
            Stack lessons, run real code, crush quizzes, review smart flashcards, earn badges — with an
            AI tutor cheering you on every step. 🎉
          </p>
          <div class="mt-8 flex flex-wrap gap-3 text-sm">
            <span class="chip bg-white/10">🟨 JavaScript</span>
            <span class="chip bg-white/10">🐍 Python</span>
            <span class="chip bg-white/10">🗄️ SQL</span>
            <span class="chip bg-white/10">🏅 Badges</span>
            <span class="chip bg-white/10">🔥 Streaks</span>
            <span class="chip bg-white/10">🤖 AI Tutor</span>
          </div>
        </div>
        <p class="relative text-sm text-slate-400">Built for everyday training. One lesson at a time.</p>
      </div>

      <!-- Auth form -->
      <div class="flex items-center justify-center p-6">
        <div class="w-full max-w-sm animate-float-up">
          <div class="mb-6 flex items-center gap-2 text-xl font-extrabold lg:hidden">
            <span class="text-2xl">⚡</span> DevJ<span class="gradient-text">Tutor</span>
          </div>
          <h2 class="text-2xl font-extrabold">{{ mode() === 'signin' ? 'Welcome back!' : 'Start your journey' }}</h2>
          <p class="mt-1 text-slate-500 dark:text-slate-400">
            {{ mode() === 'signin' ? 'Let’s keep the streak alive. 🔥' : 'Create your free account in seconds.' }}
          </p>

          <form class="mt-6 space-y-3" (ngSubmit)="submit()">
            @if (mode() === 'signup') {
              <input class="input" placeholder="Your name" [(ngModel)]="name" name="name" autocomplete="name" />
            }
            <input class="input" type="email" placeholder="Email" [(ngModel)]="email" name="email" autocomplete="email" required />
            <input
              class="input"
              type="password"
              placeholder="Password"
              [(ngModel)]="password"
              name="password"
              autocomplete="{{ mode() === 'signin' ? 'current-password' : 'new-password' }}"
              required
            />

            @if (error()) {
              <p class="rounded-xl bg-rose-50 px-3 py-2 text-sm font-medium text-rose-600 dark:bg-rose-500/10 dark:text-rose-300">
                {{ error() }}
              </p>
            }

            <button class="btn-primary w-full" type="submit" [disabled]="loading()">
              {{ loading() ? 'One sec…' : mode() === 'signin' ? 'Sign in' : 'Create account' }}
            </button>
          </form>

          <div class="my-4 flex items-center gap-3 text-xs text-slate-400">
            <span class="h-px flex-1 bg-slate-200 dark:bg-white/10"></span> OR
            <span class="h-px flex-1 bg-slate-200 dark:bg-white/10"></span>
          </div>

          <button class="btn-outline w-full" (click)="google()" [disabled]="loading()">
            <span class="text-lg">🟦</span> Continue with Google
          </button>

          <p class="mt-6 text-center text-sm text-slate-500">
            {{ mode() === 'signin' ? 'New here?' : 'Already have an account?' }}
            <button class="font-bold text-brand-600 hover:underline" (click)="toggleMode()">
              {{ mode() === 'signin' ? 'Create an account' : 'Sign in' }}
            </button>
          </p>
        </div>
      </div>
    </div>
  `,
})
export class Welcome {
  private auth = inject(AuthService);
  private router = inject(Router);

  protected mode = signal<'signin' | 'signup'>('signin');
  protected name = environment.ownerName;
  protected email = '';
  protected password = '';
  protected loading = signal(false);
  protected error = signal('');

  toggleMode(): void {
    this.mode.set(this.mode() === 'signin' ? 'signup' : 'signin');
    this.error.set('');
  }

  async submit(): Promise<void> {
    if (!this.email || !this.password) {
      this.error.set('Please enter your email and password.');
      return;
    }
    this.loading.set(true);
    this.error.set('');
    try {
      if (this.mode() === 'signin') {
        await this.auth.signInWithEmail(this.email, this.password);
      } else {
        await this.auth.signUpWithEmail(this.name, this.email, this.password);
      }
      await this.router.navigate(['/dashboard']);
    } catch (err) {
      this.error.set(this.auth.friendlyError(err));
    } finally {
      this.loading.set(false);
    }
  }

  async google(): Promise<void> {
    this.loading.set(true);
    this.error.set('');
    try {
      await this.auth.signInWithGoogle();
      await this.router.navigate(['/dashboard']);
    } catch (err) {
      this.error.set(this.auth.friendlyError(err));
    } finally {
      this.loading.set(false);
    }
  }
}
