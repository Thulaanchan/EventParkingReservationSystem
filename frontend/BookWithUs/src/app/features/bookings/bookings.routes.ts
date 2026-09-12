import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';

export const BOOKINGS_ROUTES: Routes = [
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/my-bookings-page/my-bookings-page.component').then(
        (m) => m.MyBookingsPageComponent
      )
  },
  {
    path: ':id',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/booking-details-page/booking-details-page.component').then(
        (m) => m.BookingDetailsPageComponent
      )
  }
];

export default BOOKINGS_ROUTES;
