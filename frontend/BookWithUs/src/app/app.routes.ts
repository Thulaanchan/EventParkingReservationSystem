import { Routes } from '@angular/router';

import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';
import { checkoutGuard } from './core/guards/checkout.guard';

export const routes: Routes = [

  // Default route
{
  path: '',
  pathMatch: 'full',
  redirectTo: 'auth/login'
},


  // Direct Login Route
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/pages/login-page/login-page.component')
        .then((m) => m.LoginPageComponent),
    title: 'Sign In - BookWithUs'
  },


  // Direct Register Route
  {
    path: 'register',
    loadComponent: () =>
      import('./features/auth/pages/register-page/register-page.component')
        .then((m) => m.RegisterPageComponent),
    title: 'Register - BookWithUs'
  },


  // Auth Module
  // Existing:
  // /auth/login
  // /auth/register
  {
    path: 'auth',
    loadChildren: () =>
      import('./features/auth/auth.routes').then(
        (m) => m.AUTH_ROUTES ?? m.authRoutes ?? m.default
      )
  },


  // Events
  {
    path: 'events',
    loadChildren: () =>
      import('./features/events/events.routes').then(
        (m) => m.EVENTS_ROUTES ?? m.eventsRoutes ?? m.default
      )
  },


  // Seats
  {
    path: 'seats',
    loadChildren: () =>
      import('./features/seats/seat.routes').then(
        (m) => m.SEAT_ROUTES ?? m.seatRoutes ?? m.default
      )
  },


  // Parking
  {
    path: 'parking',
    loadChildren: () =>
      import('./features/parking/parking.routes').then(
        (m) => m.PARKING_ROUTES ?? m.parkingRoutes ?? m.default
      )
  },


  // Checkout
  {
    path: 'checkout',
    canActivate: [checkoutGuard],
    loadChildren: () =>
      import('./features/checkout/checkout.routes').then(
        (m) => m.CHECKOUT_ROUTES ?? m.checkoutRoutes ?? m.default
      )
  },


  // Customer Bookings
  {
    path: 'bookings',
    canActivate: [authGuard],
    loadChildren: () =>
      import('./features/bookings/bookings.routes').then(
        (m) => m.BOOKINGS_ROUTES ?? m.bookingsRoutes ?? m.default
      )
  },


  // Customer Dashboard
  {
    path: 'customer-dashboard',
    canActivate: [authGuard],
    loadChildren: () =>
      import('./features/customer-dashboard/customer-dashboard.routes').then(
        (m) => m.CUSTOMER_DASHBOARD_ROUTES ?? m.default
      )
  },


  // Customer Alias Route
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


  // Profile
  {
    path: 'profile',
    canActivate: [authGuard],
    loadChildren: () =>
      import('./features/profile/profile.routes').then(
        (m) => m.PROFILE_ROUTES ?? m.profileRoutes ?? m.default
      )
  },


  // Payments
  {
    path: 'payments',
    loadChildren: () =>
      import('./features/payments/payments.routes').then(
        (m) =>
          m.PAYMENTS_ROUTES ??
          m.paymentRoutes ??
          m.paymentsRoutes ??
          m.default
      )
  },


  // Notifications
  {
    path: 'notifications',
    canActivate: [authGuard],
    loadChildren: () =>
      import('./features/notifications/notifications.routes').then(
        (m) => m.notificationsRoutes ?? m.routes ?? m.default
      )
  },


  // Admin
  {
    path: 'admin',
    canActivate: [adminGuard],
    loadChildren: () =>
      import('./features/admin/admin.routes').then(
        (m) => m.ADMIN_ROUTES ?? m.adminRoutes ?? m.default
      )
  },


  // Unauthorized
  {
    path: 'unauthorized',
    loadComponent: () =>
      import('./shared/pages/unauthorized/unauthorized-page.component')
        .then((m) => m.UnauthorizedPageComponent),

    title: 'Unauthorized - BookWithUs'
  },


  // 404
  {
    path: '**',
    loadComponent: () =>
      import('./features/errors/not-found-page/not-found-page.component')
        .then((m) => m.NotFoundPageComponent),

    title: 'Page Not Found - BookWithUs'
  }

];