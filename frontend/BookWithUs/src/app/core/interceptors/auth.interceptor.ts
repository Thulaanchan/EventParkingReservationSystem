import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpHandlerFn,
  HttpInterceptor,
  HttpInterceptorFn,
  HttpRequest
} from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, catchError, throwError } from 'rxjs';
import { AuthSessionService } from '../services/auth/auth-session.service';

/**
 * Functional HTTP interceptor for Angular standalone configuration.
 * Attaches Authorization: Bearer <token> header when a valid, non-empty session token exists.
 * Catches 401 Unauthorized responses to trigger clean logout and redirect to login.
 */
export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  const authSessionService = inject(AuthSessionService);
  const router = inject(Router);
  const token = authSessionService.getToken();

  let outgoingReq = req;
  if (token && typeof token === 'string' && token.trim().length > 0) {
    outgoingReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token.trim()}`
      }
    });
  }

  return next(outgoingReq).pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse && error.status === 401) {
        if (!req.url.includes('/api/auth/login')) {
          authSessionService.clearSession();
          router.navigate(['/auth/login']);
        }
      }
      return throwError(() => error);
    })
  );
};

/**
 * Class-based HTTP interceptor for NgModule / HTTP_INTERCEPTORS provider configuration.
 */
@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private readonly authSessionService = inject(AuthSessionService);
  private readonly router = inject(Router);

  intercept(
    req: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    const token = this.authSessionService.getToken();
    let outgoingReq = req;

    if (token && typeof token === 'string' && token.trim().length > 0) {
      outgoingReq = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token.trim()}`
        }
      });
    }

    return next.handle(outgoingReq).pipe(
      catchError((error: unknown) => {
        if (error instanceof HttpErrorResponse && error.status === 401) {
          if (!req.url.includes('/api/auth/login')) {
            this.authSessionService.clearSession();
            this.router.navigate(['/auth/login']);
          }
        }
        return throwError(() => error);
      })
    );
  }
}
