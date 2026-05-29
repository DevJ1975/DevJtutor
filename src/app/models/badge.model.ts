export type BadgeRule =
  | { kind: 'firstLesson' }
  | { kind: 'lessonsCompleted'; count: number }
  | { kind: 'streak'; days: number }
  | { kind: 'perfectQuiz' }
  | { kind: 'tierMastered'; language: string; tier: string }
  | { kind: 'languageStarted'; language: string }
  | { kind: 'xpReached'; xp: number }
  | { kind: 'flashcardsReviewed'; count: number };

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  /** Tailwind gradient classes for the badge medallion. */
  gradient: string;
  rule: BadgeRule;
}

export interface EarnedBadge {
  badgeId: string;
  earnedAt: number;
}
