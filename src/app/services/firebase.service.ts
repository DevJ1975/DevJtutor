import { Injectable } from '@angular/core';
import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAnalytics, isSupported, Analytics, logEvent } from 'firebase/analytics';
import { environment } from '../../environments/environment';

/**
 * Single entry point that initializes the Firebase app and exposes the
 * Auth/Firestore handles used by the other services. Analytics is loaded
 * lazily and best-effort (it fails silently in unsupported environments).
 */
@Injectable({ providedIn: 'root' })
export class FirebaseService {
  readonly app: FirebaseApp;
  readonly auth: Auth;
  readonly db: Firestore;
  private analytics: Analytics | null = null;

  constructor() {
    this.app = initializeApp(environment.firebase);
    this.auth = getAuth(this.app);
    this.db = getFirestore(this.app);

    // Analytics only works in a browser with a measurementId — guard it.
    isSupported()
      .then((ok) => {
        if (ok) this.analytics = getAnalytics(this.app);
      })
      .catch(() => void 0);
  }

  /** Best-effort analytics event; never throws. */
  track(name: string, params?: Record<string, unknown>): void {
    try {
      if (this.analytics) logEvent(this.analytics, name as string, params as Record<string, unknown>);
    } catch {
      /* ignore */
    }
  }
}
