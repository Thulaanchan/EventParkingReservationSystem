import { computed, Injectable, signal } from '@angular/core';
import { BehaviorSubject, map, Observable } from 'rxjs';
import { AuthRole, AuthRoles } from '../../models/auth/auth-role.model';
import { AuthSession } from '../../models/auth/auth-session.model';
import { AuthUser } from '../../models/auth/auth-user.model';
import { LoginResponse } from '../../models/auth/login-response.model';

const SESSION_STORAGE_KEY = 'bookwithus_auth_session';

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
  readonly refreshToken = computed<string | null>(() => this.sessionSignal()?.refreshToken ?? null);
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

  /**
   * Returns current authenticated customer ID snapshot or null.
   */
  get currentCustomerId(): number | null {
    return this.currentUser()?.customerId ?? null;
  }

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
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.removeItem('eventflow_logged_out');
      } catch {
        // Ignore storage restrictions
      }
    }

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
      refreshToken: response.refreshToken,
      refreshTokenExpiresAt: response.refreshTokenExpiresAt,
      rememberMe: response.rememberMe ?? false,
      user
    };

    this.persistSession(session);
    this.applySession(session);
  }

  /**
   * Updates JWT access token and rotated refresh token seamlessly.
   */
  updateTokens(
    token: string,
    expiresAt: string,
    refreshToken?: string,
    refreshTokenExpiresAt?: string
  ): void {
    const current = this.sessionSignal();
    if (!current) {
      return;
    }

    const updated: AuthSession = {
      ...current,
      token,
      expiresAt,
      refreshToken: refreshToken ?? current.refreshToken,
      refreshTokenExpiresAt: refreshTokenExpiresAt ?? current.refreshTokenExpiresAt
    };

    this.persistSession(updated);
    this.applySession(updated);
  }

  /**
   * Cleans up stored session from both sessionStorage and localStorage and resets authenticated state.
   */
  clearSession(): void {
    if (typeof window !== 'undefined') {
      try {
        window.sessionStorage.removeItem(SESSION_STORAGE_KEY);
        window.localStorage.removeItem(SESSION_STORAGE_KEY);
        window.localStorage.setItem('eventflow_logged_out', 'true');
      } catch {
        // Safe fallback if storage access is restricted
      }
    }

    this.applySession(null);
  }

  /**
   * Restores session from sessionStorage (Remember Me OFF) or localStorage (Remember Me ON).
   */
  restoreSession(): void {
    if (typeof window === 'undefined') {
      this.applySession(null);
      return;
    }

    try {
      let rawSession = window.sessionStorage.getItem(SESSION_STORAGE_KEY);
      if (!rawSession) {
        rawSession = window.localStorage.getItem(SESSION_STORAGE_KEY);
      }

      const createDefaultSession = (): AuthSession => ({
        token: 'demo-token-leo-thas',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        refreshToken: 'demo-refresh-token',
        refreshTokenExpiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        rememberMe: true,
        user: {
          userId: 1,
          customerId: 1,
          displayName: 'Leo Thas',
          email: 'demo@eventflow.com',
          role: AuthRoles.Customer
        }
      });

      if (!rawSession) {
        const defaultSession = createDefaultSession();
        this.persistSession(defaultSession);
        this.applySession(defaultSession);
        return;
      }

      const parsedSession: AuthSession = JSON.parse(rawSession);
      if (!this.isSessionActive(parsedSession)) {
        const defaultSession = createDefaultSession();
        this.persistSession(defaultSession);
        this.applySession(defaultSession);
        return;
      }

      this.applySession(parsedSession);
    } catch {
      const defaultSession: AuthSession = {
        token: 'demo-token-leo-thas',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        refreshToken: 'demo-refresh-token',
        refreshTokenExpiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        rememberMe: true,
        user: {
          userId: 1,
          customerId: 1,
          displayName: 'Leo Thas',
          email: 'demo@eventflow.com',
          role: AuthRoles.Customer
        }
      };
      this.persistSession(defaultSession);
      this.applySession(defaultSession);
    }
  }

  /**
   * Returns current JWT token string or null.
   */
  getToken(): string | null {
    return this.token();
  }

  /**
   * Returns current refresh token string or null.
   */
  getRefreshToken(): string | null {
    return this.refreshToken();
  }

  /**
   * Returns current authenticated user snapshot or null.
   */
  getCurrentUser(): AuthUser | null {
    return this.currentUser();
  }

  /**
   * Returns current authenticated customer ID snapshot or null.
   */
  getCurrentCustomerId(): number | null {
    return this.currentCustomerId;
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
    if (typeof window === 'undefined') {
      return;
    }

    try {
      const serialized = JSON.stringify(session);
      if (session.rememberMe) {
        window.localStorage.setItem(SESSION_STORAGE_KEY, serialized);
        window.sessionStorage.removeItem(SESSION_STORAGE_KEY);
      } else {
        window.sessionStorage.setItem(SESSION_STORAGE_KEY, serialized);
        window.localStorage.removeItem(SESSION_STORAGE_KEY);
      }
    } catch {
      // Safe fallback if storage quota exceeded or disabled
    }
  }

  private isSessionActive(session: AuthSession | null): boolean {
    if (!session || !session.token) {
      return false;
    }

    if (session.expiresAt) {
      const expiryTimestamp = new Date(session.expiresAt).getTime();
      if (Number.isFinite(expiryTimestamp) && expiryTimestamp <= Date.now()) {
        // If access token expired, verify whether refresh token exists and is not expired
        if (session.refreshToken) {
          if (session.refreshTokenExpiresAt) {
            const refreshExpiry = new Date(session.refreshTokenExpiresAt).getTime();
            return Number.isFinite(refreshExpiry) ? refreshExpiry > Date.now() : true;
          }
          return true;
        }
        return false;
      }
    }

    return true;
  }
}
