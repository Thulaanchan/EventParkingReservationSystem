import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';

import { AuthSessionService } from '../services/auth/auth-session.service';
import { AuthRole } from '../models/auth/auth-role.model';

export const adminGuard: CanActivateFn = (route, state): boolean | UrlTree => {
  const authSessionService = inject(AuthSessionService);
  const router = inject(Router);

  if (
    authSessionService.isAuthenticated() &&
    authSessionService.getRole() === AuthRole.Administrator
  ) {
    return true;
  }

  return router.createUrlTree(['/unauthorized']);
};
