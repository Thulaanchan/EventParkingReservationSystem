export interface UserCredentialConfig {
  role: 'Administrator' | 'Customer';
  email: string;
  password: string;
  displayName: string;
  dashboardUrl: string;
  note: string;
}

export interface AppCredentialsConfig {
  title: string;
  admin: UserCredentialConfig;
  customer: UserCredentialConfig;
}

export const APP_CREDENTIALS: AppCredentialsConfig = {
  title: 'BookWithUs System Credentials',
  admin: {
    role: 'Administrator',
    email: 'adminmonkeys@gmail.com',
    password: 'Adminmonkeys@123',
    displayName: 'Admin Monkeys',
    dashboardUrl: '/admin/dashboard',
    note: 'Permanently hardcoded administrator account to log in and manage events, venues, seats, categories, bookings, and payments.'
  },
  customer: {
    role: 'Customer',
    email: 'customer@bookwithus.com',
    password: 'Customer@BookWithUs2026!',
    displayName: 'Demo Customer',
    dashboardUrl: '/customer/dashboard',
    note: 'Standard customer account to browse events, book seats, select parking, and review bookings.'
  }
};
