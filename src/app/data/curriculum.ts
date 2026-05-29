import { Course, Lesson, LanguageId, Tier } from '../models/curriculum.model';
import { JAVASCRIPT_COURSE } from './javascript.curriculum';
import { PYTHON_COURSE } from './python.curriculum';
import { SQL_COURSE } from './sql.curriculum';

export const COURSES: Course[] = [JAVASCRIPT_COURSE, PYTHON_COURSE, SQL_COURSE];

export const COURSE_BY_ID = new Map<LanguageId, Course>(COURSES.map((c) => [c.id, c]));

export const TIERS: Tier[] = ['beginner', 'intermediate', 'advanced'];

export const TIER_LABEL: Record<Tier, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced · Mastery',
};

export interface FlatLesson extends Lesson {
  language: LanguageId;
  moduleId: string;
  moduleTitle: string;
}

/** All lessons across every course, flattened with their language/module. */
export const ALL_LESSONS: FlatLesson[] = COURSES.flatMap((course) =>
  course.modules.flatMap((m) =>
    m.lessons.map((l) => ({
      ...l,
      language: course.id,
      moduleId: m.id,
      moduleTitle: m.title,
    })),
  ),
);

export const LESSON_BY_ID = new Map<string, FlatLesson>(ALL_LESSONS.map((l) => [l.id, l]));

export const TOTAL_LESSON_COUNT = ALL_LESSONS.length;

export function lessonsForLanguage(lang: LanguageId): FlatLesson[] {
  return ALL_LESSONS.filter((l) => l.language === lang);
}

export function lessonsForTier(lang: LanguageId, tier: Tier): FlatLesson[] {
  return ALL_LESSONS.filter((l) => l.language === lang && l.tier === tier);
}
