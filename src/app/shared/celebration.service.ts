import { Injectable, inject, signal } from '@angular/core';
import { Badge } from '../models/badge.model';
import { CompletionResult } from '../services/gamification.service';
import { ConfettiService } from '../services/confetti.service';
import { AffirmationService } from '../services/affirmation.service';

export interface Toast {
  id: number;
  icon: string;
  title: string;
  detail?: string;
}

/** Central place to fire confetti + toasts + badge modal from anywhere. */
@Injectable({ providedIn: 'root' })
export class CelebrationService {
  private confetti = inject(ConfettiService);
  private affirm = inject(AffirmationService);

  readonly toasts = signal<Toast[]>([]);
  /** When set, a full-screen badge unlock modal is shown. */
  readonly badgeModal = signal<Badge | null>(null);
  private seq = 0;

  toast(icon: string, title: string, detail?: string): void {
    const id = ++this.seq;
    this.toasts.update((t) => [...t, { id, icon, title, detail }]);
    setTimeout(() => this.dismiss(id), 4200);
  }

  dismiss(id: number): void {
    this.toasts.update((t) => t.filter((x) => x.id !== id));
  }

  dismissBadge(): void {
    this.badgeModal.set(null);
  }

  /** Interpret a lesson/flashcard result and fire the right celebrations. */
  celebrate(result: CompletionResult, name: string): void {
    if (result.xpGained > 0) {
      this.confetti.burst();
      this.toast('⚡', `+${result.xpGained} XP`, result.streakIncreased ? this.affirm.streak(name, result.streak) : undefined);
    }
    if (result.leveledUp) {
      this.confetti.celebrate();
      this.toast('⬆️', `Level ${result.newLevel}!`, this.affirm.levelUp(name, result.newLevel));
    }
    if (result.newBadges.length) {
      this.confetti.celebrate();
      // Show the first new badge in a modal; queue the rest as toasts.
      this.badgeModal.set(result.newBadges[0]);
      result.newBadges.slice(1).forEach((b) => this.toast(b.icon, `Badge: ${b.name}`, b.description));
    }
  }
}
