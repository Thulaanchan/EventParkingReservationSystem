import { Routes } from '@angular/router';
import { adminGuard } from '../../core/guards/admin.guard';

export const adminRoutes: Routes = [
  {
    path: 'payments',
    canActivate: [adminGuard],
    loadComponent: () =>
      import(
        './payments/pages/admin-payment-management-page/admin-payment-management-page.component'
      ).then((m) => m.AdminPaymentManagementPageComponent)
  }
];

export const routes: Routes = adminRoutes;
export default adminRoutes;
