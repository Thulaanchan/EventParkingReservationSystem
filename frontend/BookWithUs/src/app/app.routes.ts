import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'payments',
    loadChildren: () =>
      import('./features/payments/payments.routes').then(
        (m) => m.paymentRoutes
      )
  },
  {
    path: 'notifications',
    canActivate: [authGuard],
    loadChildren: () =>
      import('./features/notifications/notifications.routes').then(
        (m) => m.notificationsRoutes
      )
  },
  {
    path: 'admin',
    loadChildren: () =>
      import('./features/admin/admin.routes').then(
        (m) => m.adminRoutes
      )
  },
  {
    path: 'unauthorized',
    loadComponent: () =>
      import('./shared/pages/unauthorized/unauthorized-page.component').then(
        (m) => m.UnauthorizedPageComponent
      )
  }
];
