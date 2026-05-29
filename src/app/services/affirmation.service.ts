import { Injectable } from '@angular/core';
import { AFFIRMATIONS, LEVEL_UP, QUIZ_ENCOURAGE, QUIZ_PRAISE, STREAK_CHEERS } from '../data/affirmations';
import { pick } from './util';

@Injectable({ providedIn: 'root' })
export class AffirmationService {
  private fill(template: string, vars: Record<string, string | number>): string {
    return template.replace(/\{(\w+)\}/g, (_, k) => `${vars[k] ?? ''}`);
  }

  /** Time-of-day aware greeting. */
  greeting(name: string, d = new Date()): string {
    const h = d.getHours();
    const part = h < 5 ? 'Burning the midnight oil' : h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : h < 21 ? 'Good evening' : 'Winding down';
    const emoji = h < 12 ? '🌅' : h < 17 ? '☀️' : h < 21 ? '🌆' : '🌙';
    return `${part}, ${name} ${emoji}`;
  }

  affirmation(name: string): string {
    return this.fill(pick(AFFIRMATIONS), { name });
  }

  quizPraise(name: string): string {
    return this.fill(pick(QUIZ_PRAISE), { name });
  }

  quizEncourage(name: string): string {
    return this.fill(pick(QUIZ_ENCOURAGE), { name });
  }

  levelUp(name: string, level: number): string {
    return this.fill(pick(LEVEL_UP), { name, level });
  }

  streak(name: string, count: number): string {
    return this.fill(pick(STREAK_CHEERS), { name, count });
  }
}
