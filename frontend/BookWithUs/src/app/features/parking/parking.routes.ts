import { Routes } from '@angular/router';
import { ParkingSelectionPageComponent } from './pages/parking-selection-page/parking-selection-page.component';

export const PARKING_ROUTES: Routes = [
  {
    path: '',
    component: ParkingSelectionPageComponent,
    title: 'Select Parking - BookWithUs'
  }
];

export default PARKING_ROUTES;
