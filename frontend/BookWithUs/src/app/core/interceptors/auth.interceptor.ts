import {
  HttpEvent,
  HttpHandler,
  HttpHandlerFn,
  HttpInterceptor,
  HttpInterceptorFn,
  HttpRequest
} from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthSessionService } from '../services/auth/auth-session.service';

/**
 * Functional HTTP interceptor for Angular standalone configuration.
 * Attaches Authorization: Bearer <token> header when a valid, non-empty session token exists.
 */
export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  const authSessionService = inject(AuthSessionService);
  const token = authSessionService.getToken();

  if (token && typeof token === 'string' && token.trim().length > 0) {
    const authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token.trim()}`
      }
    });
    return next(authReq);
  }

  return next(req);
};

/**
 * Class-based HTTP interceptor for NgModule / HTTP_INTERCEPTORS provider configuration.
 */
@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private readonly authSessionService = inject(AuthSessionService);

  intercept(
    req: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    const token = this.authSessionService.getToken();

    if (token && typeof token === 'string' && token.trim().length > 0) {
      const authReq = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token.trim()}`
        }
      });
      return next.handle(authReq);
    }

    return next.handle(req);
  }
}
