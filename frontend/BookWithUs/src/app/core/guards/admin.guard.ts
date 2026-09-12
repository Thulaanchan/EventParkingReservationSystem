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
import { AuthRoles } from '../models/auth/auth-role.model';
import { AuthSessionService } from '../services/auth/auth-session.service';

/**
 * Functional guard ensuring access only for authenticated Administrator users.
 * - Unauthenticated users are redirected to /auth/login with redirectUrl query parameter.
 * - Authenticated non-admin users (Customers) are redirected safely to /customer/dashboard.
 */
export const adminGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  const authSessionService = inject(AuthSessionService);
  const router = inject(Router);

  // If not authenticated, redirect to login preserving redirectUrl
  if (!authSessionService.isAuthenticated()) {
    const attemptedUrl = state.url;
    if (attemptedUrl && attemptedUrl.startsWith('/auth/login')) {
      return true;
    }
    return router.createUrlTree(['/auth/login'], {
      queryParams: attemptedUrl && attemptedUrl !== '/' ? { redirectUrl: attemptedUrl } : undefined
    });
  }

  // Allow only Administrator users
  if (authSessionService.isAdmin() || authSessionService.hasRole(AuthRoles.Administrator)) {
    return true;
  }

  // Authenticated users without Administrator role (e.g. Customers) are redirected to customer area
  return router.createUrlTree(['/customer/dashboard']);
};

/**
 * Functional child guard for nested admin routes.
 */
export const adminChildGuard: CanActivateChildFn = (
  childRoute: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  return adminGuard(childRoute, state);
};

/**
 * Class-based guard wrapper for compatibility with module-based or class-based route definitions.
 */
@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate, CanActivateChild {
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean | UrlTree {
    return adminGuard(route, state) as boolean | UrlTree;
  }

  canActivateChild(
    childRoute: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean | UrlTree {
    return adminChildGuard(childRoute, state) as boolean | UrlTree;
  }
}
