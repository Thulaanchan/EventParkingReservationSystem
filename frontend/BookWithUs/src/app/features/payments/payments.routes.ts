import { Routes } from '@angular/router';
import { PaymentCheckoutPageComponent } from './pages/payment-checkout-page/payment-checkout-page.component';

export const paymentRoutes: Routes = [
  {
    path: 'checkout/:bookingId',
    component: PaymentCheckoutPageComponent
  },
  {
    path: 'confirmation/:bookingId',
    loadComponent: () =>
      import(
        './pages/payment-confirmation-page/payment-confirmation-page.component'
      ).then((m) => m.PaymentConfirmationPageComponent)
  },
  {
    path: 'receipt/:paymentId',
    loadComponent: () =>
      import(
        './pages/payment-receipt-page/payment-receipt-page.component'
      ).then((m) => m.PaymentReceiptPageComponent)
  }
];
