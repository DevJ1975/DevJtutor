import { Injectable, computed, inject, signal } from '@angular/core';
import {
  GoogleAuthProvider,
  User,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInAnonymously,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { FirebaseService } from './firebase.service';
import { environment } from '../../environments/environment';
import { LOCAL_GUEST_UID } from './local-store';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private fb = inject(FirebaseService);

  /** Current Firebase user (null when signed out). */
  readonly user = signal<User | null>(null);
  /** Becomes true once the initial auth state has resolved. */
  readonly ready = signal(false);
  /** True when running as the offline local guest (no Firebase auth). */
  readonly localGuest = signal(false);

  readonly isAuthenticated = computed(() => !!this.user());

  private resolveReady!: () => void;
  /** Resolves once the first auth-state callback has fired. */
  readonly readyPromise = new Promise<void>((r) => (this.resolveReady = r));
  private triedAnon = false;

  constructor() {
    onAuthStateChanged(this.fb.auth, async (u) => {
      if (this.localGuest()) return; // once local guest, ignore further events
      // Guest mode: auto sign-in anonymously so the login screen is skipped
      // while still giving us a real uid for Firestore persistence.
      if (!u && environment.autoGuestLogin && !this.triedAnon) {
        this.triedAnon = true;
        try {
          await signInAnonymously(this.fb.auth);
          return; // onAuthStateChanged re-fires with the anonymous user
        } catch {
          // Anonymous provider unavailable (not enabled / offline) — enter the
          // app as a fully local guest so the login screen is never shown.
          this.enterLocalGuest();
          return;
        }
      }
      this.user.set(u);
      this.ready.set(true);
      this.resolveReady();
    });

    // Safety net: if auth doesn't resolve quickly (e.g. the anonymous call
    // hangs offline), drop into local-guest so the app never stalls on a blank
    // or login screen.
    if (environment.autoGuestLogin) {
      setTimeout(() => {
        if (!this.ready()) this.enterLocalGuest();
      }, 3000);
    }
  }

  async signUpWithEmail(name: string, email: string, password: string): Promise<void> {
    const cred = await createUserWithEmailAndPassword(this.fb.auth, email, password);
    if (name) await updateProfile(cred.user, { displayName: name });
    // Refresh local signal so displayName is available immediately.
    this.user.set(this.fb.auth.currentUser);
    this.fb.track('sign_up', { method: 'email' });
  }

  async signInWithEmail(email: string, password: string): Promise<void> {
    await signInWithEmailAndPassword(this.fb.auth, email, password);
    this.fb.track('login', { method: 'email' });
  }

  async signInWithGoogle(): Promise<void> {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(this.fb.auth, provider);
    this.fb.track('login', { method: 'google' });
  }

  /** Enter the app as an offline local guest (synthetic user, localStorage data). */
  private enterLocalGuest(): void {
    if (this.localGuest()) return;
    this.localGuest.set(true);
    this.user.set({
      uid: LOCAL_GUEST_UID,
      displayName: environment.ownerName || 'Guest',
      email: null,
      isAnonymous: true,
    } as unknown as User);
    this.ready.set(true);
    this.resolveReady();
  }

  async logout(): Promise<void> {
    if (this.localGuest()) return; // nothing to sign out of in local guest mode
    await signOut(this.fb.auth);
  }

  /** Maps Firebase auth error codes to friendly, encouraging messages. */
  friendlyError(err: unknown): string {
    const code = (err as { code?: string })?.code ?? '';
    switch (code) {
      case 'auth/invalid-email':
        return 'That email address looks off — mind double-checking it?';
      case 'auth/email-already-in-use':
        return 'You already have an account with that email. Try signing in!';
      case 'auth/weak-password':
        return 'Let’s make that password at least 6 characters strong. 💪';
      case 'auth/invalid-credential':
      case 'auth/wrong-password':
      case 'auth/user-not-found':
        return 'Email or password didn’t match. Give it another go!';
      case 'auth/popup-closed-by-user':
        return 'Looks like the Google window closed. Try again when ready.';
      case 'auth/operation-not-allowed':
        return 'This sign-in method isn’t enabled yet in Firebase. (Owner: enable it in the console.)';
      case 'auth/unauthorized-domain':
        return 'This domain isn’t authorized in Firebase Auth yet. (Owner: add it in the console.)';
      default:
        return 'Something went sideways. Take a breath and try again. 🌱';
    }
  }
}
