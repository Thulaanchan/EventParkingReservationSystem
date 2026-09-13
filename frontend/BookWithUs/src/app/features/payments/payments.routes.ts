import { Routes } from '@angular/router';

export const PAYMENTS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/payment-checkout-page/payment-checkout-page.component').then(
        (m) => m.PaymentCheckoutPageComponent
      )
  }
];

export default PAYMENTS_ROUTES;
