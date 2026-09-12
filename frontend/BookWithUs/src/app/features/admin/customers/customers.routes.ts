import { Routes } from '@angular/router';
import { adminGuard } from '../../../core/guards/admin.guard';
import { CustomerManagementPageComponent } from './pages/customer-management-page/customer-management-page.component';

export const CUSTOMER_ADMIN_ROUTES: Routes = [
  {
    path: '',
    component: CustomerManagementPageComponent,
    canActivate: [adminGuard]
  }
];
