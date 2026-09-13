import { Routes } from '@angular/router';

export const EVENTS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/event-list-page/event-list-page.component').then(
        (m) => m.EventListPageComponent
      ),
    title: 'Events - BookWithUs'
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./pages/event-details-page/event-details-page.component').then(
        (m) => m.EventDetailsPageComponent
      ),
    title: 'Event Details - BookWithUs'
  },
  {
    path: ':id/seats',
    loadComponent: () =>
      import('../seats/pages/seat-selection-page/seat-selection-page.component').then(
        (m) => m.SeatSelectionPageComponent
      ),
    title: 'Select Seats - BookWithUs'
  },
  {
    path: ':id/parking',
    loadComponent: () =>
      import('../parking/pages/parking-selection-page/parking-selection-page.component').then(
        (m) => m.ParkingSelectionPageComponent
      ),
    title: 'Select Parking - BookWithUs'
  }
];

export const eventRoutes: Routes = EVENTS_ROUTES;
export const eventsRoutes: Routes = EVENTS_ROUTES;
export default EVENTS_ROUTES;
