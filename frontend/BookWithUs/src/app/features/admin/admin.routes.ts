import { Routes } from '@angular/router';
import { adminGuard } from '../../core/guards/admin.guard';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    canActivate: [adminGuard],
    loadComponent: () =>
      import('./shell/admin-shell.component').then((m) => m.AdminShellComponent),
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'dashboard'
      },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./dashboard/pages/admin-dashboard-page/admin-dashboard-page.component').then(
            (m) => m.AdminDashboardPageComponent
          ),
        title: 'Admin Dashboard - BookWithUs'
      },
      {
        path: 'events',
        loadComponent: () =>
          import('./events/pages/event-management-page/event-management-page.component').then(
            (m) => m.EventManagementPageComponent
          ),
        title: 'Manage Events - BookWithUs'
      },
      {
        path: 'events/new',
        loadComponent: () =>
          import('./events/pages/event-form-page/event-form-page.component').then(
            (m) => m.EventFormPageComponent
          ),
        title: 'Create Event - BookWithUs'
      },
      {
        path: 'events/:id/edit',
        loadComponent: () =>
          import('./events/pages/event-form-page/event-form-page.component').then(
            (m) => m.EventFormPageComponent
          ),
        title: 'Edit Event - BookWithUs'
      },
      {
        path: 'events/:id/seats',
        loadComponent: () =>
          import('./events/pages/admin-seat-management-page/admin-seat-management-page.component').then(
            (m) => m.AdminSeatManagementPageComponent
          ),
        title: 'Manage Seats - BookWithUs'
      },
      {
        path: 'events/:id/parking',
        loadComponent: () =>
          import('./events/pages/admin-parking-management-page/admin-parking-management-page.component').then(
            (m) => m.AdminParkingManagementPageComponent
          ),
        title: 'Manage Parking - BookWithUs'
      },
      {
        path: 'events/:id',
        loadComponent: () =>
          import('./events/pages/event-overview-page/event-overview-page.component').then(
            (m) => m.EventOverviewPageComponent
          ),
        title: 'Event Overview - BookWithUs'
      },
      {
        path: 'venues',
        loadComponent: () =>
          import('./venues/pages/venue-management-page/venue-management-page.component').then(
            (m) => m.VenueManagementPageComponent
          ),
        title: 'Manage Venues - BookWithUs'
      },
      {
        path: 'venues/new',
        loadComponent: () =>
          import('./venues/pages/venue-form-page/venue-form-page.component').then(
            (m) => m.VenueFormPageComponent
          ),
        title: 'Create Venue - BookWithUs'
      },
      {
        path: 'venues/:id/edit',
        loadComponent: () =>
          import('./venues/pages/venue-form-page/venue-form-page.component').then(
            (m) => m.VenueFormPageComponent
          ),
        title: 'Edit Venue - BookWithUs'
      },
      {
        path: 'categories',
        loadComponent: () =>
          import('./categories/pages/category-management-page/category-management-page.component').then(
            (m) => m.CategoryManagementPageComponent
          ),
        title: 'Manage Categories - BookWithUs'
      },
      {
        path: 'categories/new',
        loadComponent: () =>
          import('./categories/pages/category-form-page/category-form-page.component').then(
            (m) => m.CategoryFormPageComponent
          ),
        title: 'Create Category - BookWithUs'
      },
      {
        path: 'categories/:id/edit',
        loadComponent: () =>
          import('./categories/pages/category-form-page/category-form-page.component').then(
            (m) => m.CategoryFormPageComponent
          ),
        title: 'Edit Category - BookWithUs'
      },
      {
        path: 'bookings',
        loadChildren: () =>
          import('./bookings/bookings.routes').then(
            (m) => m.BOOKING_ADMIN_ROUTES
          ),
        title: 'Manage Bookings - BookWithUs'
      },
      {
        path: 'customers',
        loadChildren: () =>
          import('./customers/customers.routes').then(
            (m) => m.CUSTOMER_ADMIN_ROUTES
          ),
        title: 'Manage Customers - BookWithUs'
      },
      {
        path: 'payments',
        loadComponent: () =>
          import('./payments/pages/admin-payment-management-page/admin-payment-management-page.component').then(
            (m) => m.AdminPaymentManagementPageComponent
          ),
        title: 'Manage Payments - BookWithUs'
      }
    ]
  }
];

export const adminRoutes: Routes = ADMIN_ROUTES;
export default ADMIN_ROUTES;
