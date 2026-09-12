import { Routes } from '@angular/router';
import { adminGuard } from '../../../core/guards/admin.guard';
import { BookingManagementPageComponent } from './pages/booking-management-page/booking-management-page.component';

export const BOOKING_ADMIN_ROUTES: Routes = [
  {
    path: '',
    component: BookingManagementPageComponent,
    canActivate: [adminGuard]
  }
];
