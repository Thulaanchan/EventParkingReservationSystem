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
import { BookingStateService } from '../services/bookings/booking-state.service';

/**
 * Functional guard protecting the checkout flow in Angular 21.
 *
 * Requirements:
 * 1. User must be authenticated via AuthSessionService.
 *    - If unauthenticated, redirects to /auth/login with query parameter redirectUrl=/checkout.
 * 2. In-progress booking selection must be valid via BookingStateService.
 *    - An event must be selected.
 *    - At least one seat must be selected.
 *    - Attendee details must be valid.
 *    - If booking state is incomplete, redirects back to /events.
 */
export const checkoutGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  const authSessionService = inject(AuthSessionService);
  const bookingStateService = inject(BookingStateService);
  const router = inject(Router);

  // 1. Authentication validation
  if (!authSessionService.isAuthenticated()) {
    const redirectUrl =
      state.url && state.url.length > 0 ? state.url : '/checkout';

    return router.createUrlTree(['/auth/login'], {
      queryParams: { redirectUrl }
    });
  }

  // 2. If bookingId query parameter is present, customer is paying for a confirmed backend booking
  const hasBookingId =
    route.queryParamMap.has('bookingId') ||
    route.paramMap.has('bookingId') ||
    state.url.includes('bookingId=');

  if (hasBookingId) {
    return true;
  }

  // 3. Booking selection validation using existing BookingStateService logic
  const isBookingValid =
    bookingStateService.isCheckoutReady() &&
    bookingStateService.hasEventSelected() &&
    bookingStateService.hasSeatsSelected() &&
    bookingStateService.areAttendeesValid();

  if (!isBookingValid) {
    return router.createUrlTree(['/events']);
  }

  return true;
};

/**
 * Functional child guard for child routes in checkout flow.
 */
export const checkoutChildGuard: CanActivateChildFn = (
  childRoute: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  return checkoutGuard(childRoute, state);
};

/**
 * Class-based guard wrapper for module or class-based route definitions.
 */
@Injectable({
  providedIn: 'root'
})
export class CheckoutGuard implements CanActivate, CanActivateChild {
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean | UrlTree {
    return checkoutGuard(route, state) as boolean | UrlTree;
  }

  canActivateChild(
    childRoute: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean | UrlTree {
    return checkoutChildGuard(childRoute, state) as boolean | UrlTree;
  }
}
