import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
  {
    path: 'welcome',
    canActivate: [guestGuard],
    loadComponent: () => import('./features/welcome/welcome').then((m) => m.Welcome),
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () => import('./features/dashboard/dashboard').then((m) => m.Dashboard),
  },
  {
    path: 'learn',
    canActivate: [authGuard],
    loadComponent: () => import('./features/learn/learn').then((m) => m.Learn),
  },
  {
    path: 'learn/:lang',
    canActivate: [authGuard],
    loadComponent: () => import('./features/learn/language-path').then((m) => m.LanguagePath),
  },
  {
    path: 'learn/:lang/:lessonId',
    canActivate: [authGuard],
    loadComponent: () => import('./features/lesson/lesson').then((m) => m.LessonComponent),
  },
  {
    path: 'flashcards',
    canActivate: [authGuard],
    loadComponent: () => import('./features/flashcards/flashcards').then((m) => m.Flashcards),
  },
  {
    path: 'playground',
    canActivate: [authGuard],
    loadComponent: () => import('./features/playground/playground').then((m) => m.PlaygroundPage),
  },
  {
    path: 'badges',
    canActivate: [authGuard],
    loadComponent: () => import('./features/badges/badges').then((m) => m.BadgesPage),
  },
  {
    path: 'tutor',
    canActivate: [authGuard],
    loadComponent: () => import('./features/tutor/tutor-chat').then((m) => m.TutorChat),
  },
  {
    path: 'profile',
    canActivate: [authGuard],
    loadComponent: () => import('./features/profile/profile').then((m) => m.Profile),
  },
  { path: '**', redirectTo: 'dashboard' },
];
