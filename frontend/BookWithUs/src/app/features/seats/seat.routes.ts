import { Routes } from '@angular/router';
import { SeatSelectionPageComponent } from './pages/seat-selection-page/seat-selection-page.component';

export const SEAT_ROUTES: Routes = [
  {
    path: '',
    component: SeatSelectionPageComponent,
    title: 'Select Seats - BookWithUs'
  }
];

export default SEAT_ROUTES;
