export type Theme = 'light' | 'dark';

export interface UserSettings {
  theme: Theme;
  dailyGoalXp: number;
  soundOn: boolean;
  /** Whether the learner opted into daily streak push reminders. */
  notifications: boolean;
  /** Preferred AI model id (empty = let the server pick its default). */
  tutorModel?: string;
}

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  xp: number;
  level: number;
  currentStreak: number;
  longestStreak: number;
  /** ISO date (YYYY-MM-DD) of last day the learner earned XP. */
  lastActiveDate: string;
  /** Map of ISO date -> XP earned that day, for the activity heatmap. */
  dailyXp: Record<string, number>;
  /** Lifetime count of flashcards reviewed (drives the Memory Athlete badge). */
  cardsReviewed: number;
  /** Registered FCM device tokens for push reminders. */
  fcmTokens?: string[];
  settings: UserSettings;
  createdAt: number;
}

export type LessonStatus = 'locked' | 'available' | 'completed';

export interface LessonProgress {
  lessonId: string;
  status: Exclude<LessonStatus, 'locked'>;
  bestScore: number; // 0-100, quiz score
  attempts: number;
  exercisePassed: boolean;
  completedAt: number | null;
}

/** SM-2 spaced-repetition state for a single flashcard. */
export interface CardReview {
  cardId: string;
  lessonId: string;
  language: string;
  front: string;
  back: string;
  ease: number; // SM-2 easiness factor
  interval: number; // days until next review
  reps: number;
  dueDate: string; // ISO date
  lastReviewed: string | null;
}
