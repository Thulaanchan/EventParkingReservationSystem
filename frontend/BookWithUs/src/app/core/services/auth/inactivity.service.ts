import { Injectable, inject, NgZone, DestroyRef } from '@angular/core';
import { Router } from '@angular/router';
import { fromEvent, merge, Subscription } from 'rxjs';
import { throttleTime } from 'rxjs/operators';
import { AuthSessionService } from './auth-session.service';

const INACTIVITY_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes
const ACTIVITY_THROTTLE_MS = 5000; // Throttle event handling to once every 5 seconds

@Injectable({
  providedIn: 'root'
})
export class InactivityService {
  private readonly ngZone = inject(NgZone);
  private readonly router = inject(Router);
  private readonly sessionService = inject(AuthSessionService);

  private timerId: any = null;
  private activitySubscription: Subscription | null = null;
  private isListening = false;

  constructor() {
    // Automatically manage inactivity timer based on authenticated session
    this.sessionService.session$.subscribe((session) => {
      if (session) {
        this.startMonitoring();
      } else {
        this.stopMonitoring();
      }
    });
  }

  startMonitoring(): void {
    if (this.isListening) {
      this.resetTimer();
      return;
    }

    if (typeof window === 'undefined') {
      return;
    }

    this.isListening = true;
    this.resetTimer();

    // Attach listeners OUTSIDE Angular zone to avoid triggering change detection on every mouse move
    this.ngZone.runOutsideAngular(() => {
      const mousemove$ = fromEvent(window, 'mousemove', { passive: true });
      const keydown$ = fromEvent(window, 'keydown', { passive: true });
      const click$ = fromEvent(window, 'click', { passive: true });
      const scroll$ = fromEvent(window, 'scroll', { passive: true });
      const touchstart$ = fromEvent(window, 'touchstart', { passive: true });

      const activity$ = merge(mousemove$, keydown$, click$, scroll$, touchstart$).pipe(
        throttleTime(ACTIVITY_THROTTLE_MS)
      );

      this.activitySubscription = activity$.subscribe(() => {
        this.resetTimer();
      });
    });
  }

  stopMonitoring(): void {
    this.clearTimer();
    if (this.activitySubscription) {
      this.activitySubscription.unsubscribe();
      this.activitySubscription = null;
    }
    this.isListening = false;
  }

  private resetTimer(): void {
    this.clearTimer();

    this.timerId = setTimeout(() => {
      this.handleTimeout();
    }, INACTIVITY_TIMEOUT_MS);
  }

  private clearTimer(): void {
    if (this.timerId) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
  }

  private handleTimeout(): void {
    this.stopMonitoring();

    // Re-enter Angular zone to perform navigation and state cleanup
    this.ngZone.run(() => {
      this.sessionService.clearSession();
      this.router.navigate(['/auth/login'], {
        queryParams: { reason: 'inactivity' }
      });
    });
  }
}
