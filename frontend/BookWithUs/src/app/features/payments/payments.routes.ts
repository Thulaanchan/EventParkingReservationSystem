import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';

export const PAYMENTS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/payment-checkout-page/payment-checkout-page.component').then(
        (m) => m.PaymentCheckoutPageComponent
      ),
    title: 'Payment - BookWithUs'
  },
  {
    path: 'checkout',
    loadComponent: () =>
      import('./pages/payment-checkout-page/payment-checkout-page.component').then(
        (m) => m.PaymentCheckoutPageComponent
      ),
    title: 'Payment Checkout - BookWithUs'
  },
  {
    path: 'confirmation/:bookingId',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/payment-confirmation-page/payment-confirmation-page.component').then(
        (m) => m.PaymentConfirmationPageComponent
      ),
    title: 'Payment Confirmation - BookWithUs'
  },
  {
    path: 'history',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/payment-history-page/payment-history-page.component').then(
        (m) => m.PaymentHistoryPageComponent
      ),
    title: 'Payment History - BookWithUs'
  },
  {
    path: 'receipt/:paymentId',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/payment-receipt-page/payment-receipt-page.component').then(
        (m) => m.PaymentReceiptPageComponent
      ),
    title: 'Payment Receipt - BookWithUs'
  }
];

export const paymentRoutes: Routes = PAYMENTS_ROUTES;
export const paymentsRoutes: Routes = PAYMENTS_ROUTES;
export default PAYMENTS_ROUTES;
