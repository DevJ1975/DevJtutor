import { Injectable, inject, signal } from '@angular/core';
import { environment } from '../../environments/environment';
import { FirebaseService } from './firebase.service';
import { UserService } from './user.service';
import { CelebrationService } from '../shared/celebration.service';

export type NotifyStatus = 'unsupported' | 'default' | 'granted' | 'denied';

/**
 * Web push (FCM) for daily streak reminders. The heavy `firebase/messaging`
 * module is dynamically imported only when the learner opts in, so it never
 * weighs down the initial bundle. Degrades gracefully when unsupported or when
 * the owner hasn't configured a VAPID key yet.
 */
@Injectable({ providedIn: 'root' })
export class NotificationService {
  private fb = inject(FirebaseService);
  private users = inject(UserService);
  private celebrate = inject(CelebrationService);

  readonly status = signal<NotifyStatus>('default');
  readonly note = signal('');
  private listening = false;

  constructor() {
    if (typeof Notification === 'undefined' || !('serviceWorker' in navigator)) {
      this.status.set('unsupported');
    } else {
      this.status.set(Notification.permission as NotifyStatus);
    }
  }

  get configured(): boolean {
    return !!environment.messagingVapidKey;
  }

  /** Request permission, register the SW, fetch + store the FCM token. */
  async enable(): Promise<void> {
    this.note.set('');
    if (this.status() === 'unsupported') {
      this.note.set('Push notifications aren’t supported in this browser.');
      return;
    }

    const { getMessaging, getToken, onMessage, isSupported } = await import('firebase/messaging');
    if (!(await isSupported())) {
      this.status.set('unsupported');
      this.note.set('Push notifications aren’t supported here.');
      return;
    }

    const permission = await Notification.requestPermission();
    this.status.set(permission as NotifyStatus);
    if (permission !== 'granted') {
      this.note.set('No worries — you can enable reminders anytime.');
      return;
    }

    const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
    await this.users.setNotifications(true);

    if (!this.configured) {
      // Permission is granted, but the owner must add the VAPID key to send pushes.
      this.note.set('Reminders are on! (Owner: add the FCM VAPID key to send pushes.)');
      this.startForeground(getMessaging, onMessage);
      return;
    }

    try {
      const messaging = getMessaging(this.fb.app);
      const token = await getToken(messaging, {
        vapidKey: environment.messagingVapidKey,
        serviceWorkerRegistration: registration,
      });
      if (token) {
        await this.users.addFcmToken(token);
        this.fb.track('notifications_enabled');
        this.note.set('Daily reminders are on! 🔔');
      }
      this.startForeground(getMessaging, onMessage);
    } catch {
      this.note.set('Couldn’t register for push just now. Try again later.');
    }
  }

  async disable(): Promise<void> {
    await this.users.setNotifications(false);
    this.fb.track('notifications_disabled');
    this.note.set('Reminders turned off.');
  }

  /** Show foreground messages as in-app toasts. */
  private startForeground(
    getMessaging: typeof import('firebase/messaging').getMessaging,
    onMessage: typeof import('firebase/messaging').onMessage,
  ): void {
    if (this.listening) return;
    this.listening = true;
    try {
      const messaging = getMessaging(this.fb.app);
      onMessage(messaging, (payload) => {
        const n = payload.notification;
        this.celebrate.toast('🔔', n?.title ?? 'DevJ Tutor', n?.body ?? 'Time to train!');
      });
    } catch {
      /* ignore */
    }
  }
}
