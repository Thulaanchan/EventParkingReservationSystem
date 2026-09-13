import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'payments',
    loadChildren: () =>
      import('./features/payments/payments.routes').then(
        (m) => m.paymentRoutes
      )
  }
];
