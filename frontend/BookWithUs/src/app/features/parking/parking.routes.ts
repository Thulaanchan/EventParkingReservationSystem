import { Routes } from '@angular/router';

export const PARKING_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/parking-selection-page/parking-selection-page.component').then(
        (m) => m.ParkingSelectionPageComponent
      ),
    title: 'Select Parking - BookWithUs'
  },
  {
    path: ':eventId',
    loadComponent: () =>
      import('./pages/parking-selection-page/parking-selection-page.component').then(
        (m) => m.ParkingSelectionPageComponent
      ),
    title: 'Select Parking - BookWithUs'
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./pages/parking-selection-page/parking-selection-page.component').then(
        (m) => m.ParkingSelectionPageComponent
      ),
    title: 'Select Parking - BookWithUs'
  }
];

export const parkingRoutes: Routes = PARKING_ROUTES;
export default PARKING_ROUTES;
