import { Routes } from '@angular/router';

export const SEAT_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/seat-selection-page/seat-selection-page.component').then(
        (m) => m.SeatSelectionPageComponent
      ),
    title: 'Select Seats - BookWithUs'
  },
  {
    path: ':eventId',
    loadComponent: () =>
      import('./pages/seat-selection-page/seat-selection-page.component').then(
        (m) => m.SeatSelectionPageComponent
      ),
    title: 'Select Seats - BookWithUs'
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./pages/seat-selection-page/seat-selection-page.component').then(
        (m) => m.SeatSelectionPageComponent
      ),
    title: 'Select Seats - BookWithUs'
  }
];

export const seatRoutes: Routes = SEAT_ROUTES;
export const seatsRoutes: Routes = SEAT_ROUTES;
export default SEAT_ROUTES;
