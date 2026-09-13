import { Routes } from '@angular/router';
import { checkoutGuard } from '../../core/guards/checkout.guard';

/**
 * Lazy-loaded standalone routing configuration for Checkout.
 * Protects the checkout route with checkoutGuard and nests child pages inside CheckoutShellComponent.
 */
export const CHECKOUT_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./shell/checkout-shell.component').then(
        (m) => m.CheckoutShellComponent
      ),
    canActivate: [checkoutGuard],
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'review'
      },
      {
        path: 'review',
        loadComponent: () =>
          import('./pages/booking-review-page/booking-review-page.component').then(
            (m) => m.BookingReviewPageComponent
          )
      },
      {
        path: 'payment',
        loadChildren: () =>
          import('../payments/payments.routes').then(
            (m) => m.PAYMENTS_ROUTES
          )
      }
    ]
  }
];

export default CHECKOUT_ROUTES;
