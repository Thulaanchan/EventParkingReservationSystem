import { Routes } from '@angular/router';

export const AUTH_ROUTES: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'login'
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login-page/login-page.component').then(
        (m) => m.LoginPageComponent
      ),
    title: 'Sign In - BookWithUs'
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./pages/register-page/register-page.component').then(
        (m) => m.RegisterPageComponent
      ),
    title: 'Register - BookWithUs'
  },
  {
    path: 'forgot-password',
    loadComponent: () =>
      import('./pages/forgot-password-page/forgot-password-page.component').then(
        (m) => m.ForgotPasswordPageComponent
      ),
    title: 'Forgot Password - BookWithUs'
  },
  {
    path: 'reset-password',
    loadComponent: () =>
      import('./pages/reset-password-page/reset-password-page.component').then(
        (m) => m.ResetPasswordPageComponent
      ),
    title: 'Reset Password - BookWithUs'
  },
  {
    path: 'verify-email-sent',
    loadComponent: () =>
      import('./pages/verify-email-sent-page/verify-email-sent-page.component').then(
        (m) => m.VerifyEmailSentPageComponent
      ),
    title: 'Verify Email - BookWithUs'
  },
  {
    path: 'verify-email',
    loadComponent: () =>
      import('./pages/verify-email-sent-page/verify-email-sent-page.component').then(
        (m) => m.VerifyEmailSentPageComponent
      ),
    title: 'Verify Email - BookWithUs'
  }
];

export const authRoutes: Routes = AUTH_ROUTES;
export default AUTH_ROUTES;
