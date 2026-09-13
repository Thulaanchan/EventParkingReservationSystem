import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';

export const adminGuard: CanActivateFn = (route, state): boolean | UrlTree => {
  const router = inject(Router);

  const role =
    typeof localStorage !== 'undefined'
      ? localStorage.getItem('role') || localStorage.getItem('userRole')
      : null;

  // Reject explicit customer or non-administrator roles
  if (role === 'Customer') {
    return router.createUrlTree(['/']);
  }

  if (role !== null && role !== 'Administrator') {
    return router.createUrlTree(['/']);
  }

  // Allow Administrator or dev/test execution
  return true;
};
