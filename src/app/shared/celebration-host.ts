import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CelebrationService } from './celebration.service';

@Component({
  selector: 'app-celebration-host',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- Toasts -->
    <div class="pointer-events-none fixed inset-x-0 top-4 z-[60] flex flex-col items-center gap-2 px-4">
      @for (t of celebrate.toasts(); track t.id) {
        <div
          class="card animate-pop-in pointer-events-auto flex w-full max-w-sm items-start gap-3 px-4 py-3 shadow-xl"
          (click)="celebrate.dismiss(t.id)"
        >
          <span class="text-2xl">{{ t.icon }}</span>
          <div class="min-w-0">
            <p class="font-bold leading-tight">{{ t.title }}</p>
            @if (t.detail) {
              <p class="text-sm text-slate-500 dark:text-slate-400">{{ t.detail }}</p>
            }
          </div>
        </div>
      }
    </div>

    <!-- Badge modal -->
    @if (celebrate.badgeModal(); as b) {
      <div
        class="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm"
        (click)="celebrate.dismissBadge()"
      >
        <div class="card animate-pop-in w-full max-w-sm p-8 text-center" (click)="$event.stopPropagation()">
          <p class="text-sm font-semibold uppercase tracking-widest text-brand-500">Badge unlocked!</p>
          <div
            class="mx-auto my-5 flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br text-6xl shadow-lg {{ b.gradient }}"
          >
            {{ b.icon }}
          </div>
          <h3 class="text-2xl font-extrabold">{{ b.name }}</h3>
          <p class="mt-1 text-slate-500 dark:text-slate-400">{{ b.description }}</p>
          <button class="btn-primary mt-6 w-full" (click)="celebrate.dismissBadge()">Awesome! 🎉</button>
        </div>
      </div>
    }
  `,
})
export class CelebrationHost {
  protected celebrate = inject(CelebrationService);
}
