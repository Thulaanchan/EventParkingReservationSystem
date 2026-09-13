import { inject, Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  CanActivateChild,
  CanActivateChildFn,
  CanActivateFn,
  Router,
  RouterStateSnapshot,
  UrlTree
} from '@angular/router';
import { AuthSessionService } from '../services/auth/auth-session.service';

/**
 * Functional guard ensuring access only for authenticated users.
 * Unauthenticated users are redirected to /auth/login with redirectUrl query parameter.
 */
export const authGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  const authSessionService = inject(AuthSessionService);
  const router = inject(Router);

  if (authSessionService.isAuthenticated()) {
    return true;
  }

  const attemptedUrl = state.url;
  // Prevent redirect loops if already navigating to auth login
  if (attemptedUrl && attemptedUrl.startsWith('/auth/login')) {
    return true;
  }

  return router.createUrlTree(['/auth/login'], {
    queryParams: attemptedUrl && attemptedUrl !== '/' ? { redirectUrl: attemptedUrl } : undefined
  });
};

/**
 * Functional child guard for nested routes requiring authentication.
 */
export const authChildGuard: CanActivateChildFn = (
  childRoute: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  return authGuard(childRoute, state);
};

/**
 * Class-based guard wrapper for compatibility with module-based or class-based route definitions.
 */
@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate, CanActivateChild {
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean | UrlTree {
    return authGuard(route, state) as boolean | UrlTree;
  }

  canActivateChild(
    childRoute: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean | UrlTree {
    return authChildGuard(childRoute, state) as boolean | UrlTree;
  }
}
