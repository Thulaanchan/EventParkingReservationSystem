import { inject } from '@angular/core';
import {
  HttpInterceptorFn,
  HttpRequest,
  HttpHandlerFn,
  HttpErrorResponse
} from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, catchError, filter, finalize, switchMap, take, throwError } from 'rxjs';

import { AuthSessionService } from '../services/auth/auth-session.service';
import { AuthService } from '../services/auth/auth.service';
import { ErrorHandlerService } from '../services/errors/error-handler.service';
import { LoadingService } from '../services/loading/loading.service';

let isRefreshing = false;
const refreshTokenSubject = new BehaviorSubject<string | null>(null);

export const apiInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
) => {
  const authSessionService = inject(AuthSessionService);
  const authService = inject(AuthService);
  const errorHandler = inject(ErrorHandlerService);
  const loadingService = inject(LoadingService);
  const router = inject(Router);

  const token = authSessionService.getToken();

  let authReq = req;
  if (token) {
    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  // Avoid showing global loading spinner for background token refresh
  const isRefreshRequest = req.url.includes('/api/auth/refresh');
  if (!isRefreshRequest) {
    loadingService.show();
  }

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      const isAuthEndpoint =
        req.url.includes('/api/auth/login') ||
        req.url.includes('/api/auth/refresh') ||
        req.url.includes('/api/auth/logout');

      const hasRefreshToken = !!authSessionService.getRefreshToken();
      const isDemoToken = authSessionService.getToken() === 'demo-token-leo-thas';

      // Attempt token refresh on 401 Unauthorized for standard API requests
      if (error.status === 401 && !isAuthEndpoint && hasRefreshToken && !isDemoToken) {
        if (!isRefreshing) {
          isRefreshing = true;
          refreshTokenSubject.next(null);

          return authService.refreshToken().pipe(
            switchMap((response) => {
              isRefreshing = false;
              refreshTokenSubject.next(response.token);

              return next(
                req.clone({
                  setHeaders: {
                    Authorization: `Bearer ${response.token}`
                  }
                })
              );
            }),
            catchError((refreshError) => {
              isRefreshing = false;
              refreshTokenSubject.next(null);
              authService.logout(false);
              router.navigate(['/auth/login'], {
                queryParams: { reason: 'session_expired' }
              });
              const handledError = errorHandler.handleError(refreshError);
              return throwError(() => handledError);
            })
          );
        } else {
          // Refresh is in-flight: wait for new token and replay
          return refreshTokenSubject.pipe(
            filter((newToken): newToken is string => newToken !== null),
            take(1),
            switchMap((newToken) => {
              return next(
                req.clone({
                  setHeaders: {
                    Authorization: `Bearer ${newToken}`
                  }
                })
              );
            })
          );
        }
      }

      // If 401 and cannot refresh (e.g. invalid refresh token or on auth endpoint)
      if (error.status === 401) {
        authSessionService.clearSession();
      }

      const handledError = errorHandler.handleError(error);
      return throwError(() => handledError);
    }),
    finalize(() => {
      if (!isRefreshRequest) {
        loadingService.hide();
      }
    })
  );
};
