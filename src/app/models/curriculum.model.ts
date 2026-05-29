export type LanguageId = 'javascript' | 'python' | 'sql';
export type Tier = 'beginner' | 'intermediate' | 'advanced';
export type RunnerKind = 'js' | 'python' | 'sql';

export interface QuizQuestion {
  id: string;
  prompt: string;
  /** Optional code shown with the question. */
  code?: string;
  options: string[];
  /** Index into `options`. */
  answer: number;
  explanation: string;
}

export interface TestCase {
  /** Human-readable description of what is being checked. */
  name: string;
  /**
   * Snippet appended after the learner's code. It must evaluate to a boolean
   * (JS/Python) or be a SQL assertion handled by the grader. Kept hidden from
   * the learner until they run.
   */
  assert: string;
}

export interface Exercise {
  runner: RunnerKind;
  instructions: string;
  starterCode: string;
  solution: string;
  tests: TestCase[];
  /** For SQL: schema + seed data set up before the learner's query runs. */
  setupSql?: string;
}

export interface Flashcard {
  id: string;
  front: string;
  back: string;
}

export interface Lesson {
  id: string;
  title: string;
  /** One-line hook shown in the skill tree. */
  summary: string;
  tier: Tier;
  /** Estimated minutes — sets expectations and feeds the daily goal. */
  minutes: number;
  xp: number;
  /** Lesson ids that must be completed first (stacking). */
  prerequisites: string[];
  /** Rich markdown teaching content. Empty string = "coming soon" scaffold. */
  content: string;
  exercise?: Exercise;
  quiz: QuizQuestion[];
  flashcards: Flashcard[];
}

export interface Module {
  id: string;
  title: string;
  tier: Tier;
  /** Emoji used as the module glyph in the skill tree. */
  icon: string;
  lessons: Lesson[];
}

export interface Course {
  id: LanguageId;
  name: string;
  tagline: string;
  /** Emoji glyph. */
  icon: string;
  /** Brand color hex for accents. */
  color: string;
  runner: RunnerKind;
  modules: Module[];
}
