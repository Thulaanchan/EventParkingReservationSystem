import { Routes } from '@angular/router';
import { PaymentCheckoutPageComponent } from './pages/payment-checkout-page/payment-checkout-page.component';

export const paymentRoutes: Routes = [
  {
    path: 'checkout/:bookingId',
    component: PaymentCheckoutPageComponent
  }
];
