import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';
import { checkoutGuard } from './core/guards/checkout.guard';

export const routes: Routes = [
  // Default route: redirect to events catalog
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'events'
  },

  // 1. Auth: Login, Register, Forgot Password, Reset Password, Verify Email
  {
    path: 'auth',
    loadChildren: () =>
      import('./features/auth/auth.routes').then(
        (m) => m.AUTH_ROUTES ?? m.authRoutes ?? m.default
      )
  },

  // 2. Events: Public catalog, filters, event details, and nested seat/parking selection
  {
    path: 'events',
    loadChildren: () =>
      import('./features/events/events.routes').then(
        (m) => m.EVENTS_ROUTES ?? m.eventsRoutes ?? m.default
      )
  },

  // 3. Seats: Direct seat selection
  {
    path: 'seats',
    loadChildren: () =>
      import('./features/seats/seat.routes').then(
        (m) => m.SEAT_ROUTES ?? m.seatRoutes ?? m.default
      )
  },

  // 4. Parking: Direct parking selection
  {
    path: 'parking',
    loadChildren: () =>
      import('./features/parking/parking.routes').then(
        (m) => m.PARKING_ROUTES ?? m.parkingRoutes ?? m.default
      )
  },

  // 5. Checkout: Review booking, attendee forms, payment handoff
  {
    path: 'checkout',
    canActivate: [checkoutGuard],
    loadChildren: () =>
      import('./features/checkout/checkout.routes').then(
        (m) => m.CHECKOUT_ROUTES ?? m.checkoutRoutes ?? m.default
      )
  },

  // 6. Bookings: Customer bookings, ticket pass, details, cancellation
  {
    path: 'bookings',
    canActivate: [authGuard],
    loadChildren: () =>
      import('./features/bookings/bookings.routes').then(
        (m) => m.BOOKINGS_ROUTES ?? m.bookingsRoutes ?? m.default
      )
  },

  // 7. Customer Dashboard: Customer home metrics & quick actions
  {
    path: 'customer-dashboard',
    canActivate: [authGuard],
    loadChildren: () =>
      import('./features/customer-dashboard/customer-dashboard.routes').then(
        (m) => m.CUSTOMER_DASHBOARD_ROUTES ?? m.default
      )
  },
  {
    path: 'customer',
    canActivate: [authGuard],
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'dashboard'
      },
      {
        path: 'dashboard',
        loadChildren: () =>
          import('./features/customer-dashboard/customer-dashboard.routes').then(
            (m) => m.CUSTOMER_DASHBOARD_ROUTES ?? m.default
          )
      }
    ]
  },

  // 8. Profile: Customer profile & account security
  {
    path: 'profile',
    canActivate: [authGuard],
    loadChildren: () =>
      import('./features/profile/profile.routes').then(
        (m) => m.PROFILE_ROUTES ?? m.profileRoutes ?? m.default
      )
  },

  // 9. Payments: Checkout payment, confirmation, history, receipt
  {
    path: 'payments',
    loadChildren: () =>
      import('./features/payments/payments.routes').then(
        (m) => m.PAYMENTS_ROUTES ?? m.paymentRoutes ?? m.paymentsRoutes ?? m.default
      )
  },

  // 10. Notifications: Customer notifications and bell panel
  {
    path: 'notifications',
    canActivate: [authGuard],
    loadChildren: () =>
      import('./features/notifications/notifications.routes').then(
        (m) => m.notificationsRoutes ?? m.routes ?? m.default
      )
  },

  // 11. Admin: Dashboard, Events, Venues, Categories, Bookings, Customers, Payments
  {
    path: 'admin',
    canActivate: [adminGuard],
    loadChildren: () =>
      import('./features/admin/admin.routes').then(
        (m) => m.ADMIN_ROUTES ?? m.adminRoutes ?? m.default
      )
  },

  // Unauthorized page
  {
    path: 'unauthorized',
    loadComponent: () =>
      import('./shared/pages/unauthorized/unauthorized-page.component').then(
        (m) => m.UnauthorizedPageComponent
      ),
    title: 'Unauthorized - BookWithUs'
  },

  // Wildcard 404 page
  {
    path: '**',
    loadComponent: () =>
      import('./features/errors/not-found-page/not-found-page.component').then(
        (m) => m.NotFoundPageComponent
      ),
    title: 'Page Not Found - BookWithUs'
  }
];
