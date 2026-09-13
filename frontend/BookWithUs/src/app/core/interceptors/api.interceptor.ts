import { inject } from '@angular/core';
import {
  HttpInterceptorFn,
  HttpRequest,
  HttpHandlerFn,
  HttpErrorResponse
} from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

import { AuthSessionService } from '../services/auth/auth-session.service';
import { ErrorHandlerService } from '../services/errors/error-handler.service';

export const apiInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
) => {
  const authSessionService = inject(AuthSessionService);
  const errorHandler = inject(ErrorHandlerService);

  const token = authSessionService.getToken();

  let authReq = req;
  if (token) {
    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // 401 Unauthorized: clear invalid session if supported
      if (error.status === 401) {
        authSessionService.clearSession();
      }

      const handledError = errorHandler.handleError(error);
      return throwError(() => handledError);
    })
  );
};
