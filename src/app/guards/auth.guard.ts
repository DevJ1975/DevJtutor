import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/** Blocks protected routes until auth resolves; redirects guests to /welcome. */
export const authGuard: CanActivateFn = async () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  await auth.readyPromise;
  if (auth.isAuthenticated()) return true;
  return router.createUrlTree(['/welcome']);
};

/** Keeps signed-in learners out of the welcome/login page. */
export const guestGuard: CanActivateFn = async () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  await auth.readyPromise;
  if (!auth.isAuthenticated()) return true;
  return router.createUrlTree(['/dashboard']);
};
