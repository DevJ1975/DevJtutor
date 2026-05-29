import { Injectable } from '@angular/core';
import confetti from 'canvas-confetti';

@Injectable({ providedIn: 'root' })
export class ConfettiService {
  /** A cheerful burst — used on lesson/quiz completion. */
  burst(): void {
    confetti({ particleCount: 90, spread: 70, origin: { y: 0.7 }, scalar: 0.9 });
  }

  /** A bigger celebration — used on level-ups and badges. */
  celebrate(): void {
    const end = Date.now() + 800;
    const colors = ['#6366f1', '#f97316', '#f59e0b', '#10b981'];
    const frame = () => {
      confetti({ particleCount: 4, angle: 60, spread: 60, origin: { x: 0 }, colors });
      confetti({ particleCount: 4, angle: 120, spread: 60, origin: { x: 1 }, colors });
      if (Date.now() < end) requestAnimationFrame(frame);
    };
    frame();
  }
}
