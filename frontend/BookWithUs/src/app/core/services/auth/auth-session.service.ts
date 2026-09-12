import { computed, Injectable, signal } from '@angular/core';
import { BehaviorSubject, map, Observable } from 'rxjs';
import { AuthRole, AuthRoles } from '../../models/auth/auth-role.model';
import { AuthSession } from '../../models/auth/auth-session.model';
import { AuthUser } from '../../models/auth/auth-user.model';
import { LoginResponse } from '../../models/auth/login-response.model';

const SESSION_STORAGE_KEY = 'eventflow_auth_session';

@Injectable({
  providedIn: 'root'
})
export class AuthSessionService {
  private readonly sessionSignal = signal<AuthSession | null>(null);
  private readonly sessionSubject = new BehaviorSubject<AuthSession | null>(null);

  // Signals (Angular reactive state)
  readonly session = this.sessionSignal.asReadonly();
  readonly currentUser = computed<AuthUser | null>(() => this.sessionSignal()?.user ?? null);
  readonly token = computed<string | null>(() => this.sessionSignal()?.token ?? null);
  readonly isAuthenticated = computed<boolean>(() => {
    const session = this.sessionSignal();
    return this.isSessionActive(session);
  });
  readonly isCustomer = computed<boolean>(() => {
    return this.currentUser()?.role === AuthRoles.Customer;
  });
  readonly isAdmin = computed<boolean>(() => {
    return this.currentUser()?.role === AuthRoles.Administrator;
  });

  // Observables (RxJS streams for async pipes, routing guards and interceptors)
  readonly session$: Observable<AuthSession | null> = this.sessionSubject.asObservable();
  readonly currentUser$: Observable<AuthUser | null> = this.session$.pipe(
    map((session) => session?.user ?? null)
  );
  readonly token$: Observable<string | null> = this.session$.pipe(
    map((session) => session?.token ?? null)
  );
  readonly isAuthenticated$: Observable<boolean> = this.session$.pipe(
    map((session) => this.isSessionActive(session))
  );
  readonly isCustomer$: Observable<boolean> = this.currentUser$.pipe(
    map((user) => user?.role === AuthRoles.Customer)
  );
  readonly isAdmin$: Observable<boolean> = this.currentUser$.pipe(
    map((user) => user?.role === AuthRoles.Administrator)
  );

  constructor() {
    this.restoreSession();
  }

  /**
   * Stores session state from successful login response.
   * Maps backend UserId to frontend authenticated user and customer identity.
   */
  setSession(response: LoginResponse): void {
    const user: AuthUser = {
      userId: response.userId,
      customerId: response.userId,
      displayName: response.displayName,
      email: response.email,
      role: response.role
    };

    const session: AuthSession = {
      token: response.token,
      expiresAt: response.expiresAt,
      user
    };

    this.persistSession(session);
    this.applySession(session);
  }

  /**
   * Cleans up stored session and resets authenticated state.
   */
  clearSession(): void {
    const storage = this.getStorage();
    if (storage) {
      try {
        storage.removeItem(SESSION_STORAGE_KEY);
      } catch {
        // Safe fallback if storage access is restricted
      }
    }
    this.applySession(null);
  }

  /**
   * Restores session from sessionStorage if active and unexpired.
   */
  restoreSession(): void {
    const storage = this.getStorage();
    if (!storage) {
      this.applySession(null);
      return;
    }

    try {
      const rawSession = storage.getItem(SESSION_STORAGE_KEY);
      if (!rawSession) {
        this.applySession(null);
        return;
      }

      const parsedSession: AuthSession = JSON.parse(rawSession);
      if (!this.isSessionActive(parsedSession)) {
        this.clearSession();
        return;
      }

      this.applySession(parsedSession);
    } catch {
      this.clearSession();
    }
  }

  /**
   * Returns current JWT token string or null.
   */
  getToken(): string | null {
    return this.token();
  }

  /**
   * Returns current authenticated user snapshot or null.
   */
  getCurrentUser(): AuthUser | null {
    return this.currentUser();
  }

  /**
   * Returns current authentication boolean snapshot.
   */
  isAuthenticatedUser(): boolean {
    return this.isAuthenticated();
  }

  /**
   * Checks whether the current authenticated user has a specific role.
   */
  hasRole(role: AuthRole): boolean {
    return this.currentUser()?.role === role;
  }

  /**
   * Checks whether the current authenticated user is a Customer.
   */
  isCustomerUser(): boolean {
    return this.isCustomer();
  }

  /**
   * Checks whether the current authenticated user is an Administrator.
   */
  isAdminUser(): boolean {
    return this.isAdmin();
  }

  private applySession(session: AuthSession | null): void {
    this.sessionSignal.set(session);
    this.sessionSubject.next(session);
  }

  private persistSession(session: AuthSession): void {
    const storage = this.getStorage();
    if (storage) {
      try {
        storage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
      } catch {
        // Safe fallback if storage quota exceeded or disabled
      }
    }
  }

  private isSessionActive(session: AuthSession | null): boolean {
    if (!session || !session.token) {
      return false;
    }

    if (session.expiresAt) {
      const expiryTimestamp = new Date(session.expiresAt).getTime();
      if (Number.isFinite(expiryTimestamp) && expiryTimestamp <= Date.now()) {
        return false;
      }
    }

    return true;
  }

  private getStorage(): Storage | null {
    if (typeof window !== 'undefined' && typeof window.sessionStorage !== 'undefined') {
      return window.sessionStorage;
    }
    return null;
  }
}
