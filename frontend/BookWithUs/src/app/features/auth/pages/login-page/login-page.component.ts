import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthRoles } from '../../../../core/models/auth/auth-role.model';
import { LoginRequest } from '../../../../core/models/auth/login-request.model';
import { AuthService } from '../../../../core/services/auth/auth.service';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.css'
})
export class LoginPageComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  credentials: LoginRequest = {
    email: '',
    password: '',
    rememberMe: false
  };

  isSubmitting = false;
  showPassword = false;
  errorMessage: string | null = null;

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(form: NgForm): void {
    if (this.isSubmitting) {
      return;
    }

    if (form.invalid) {
      form.control.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = null;

    this.authService.login(this.credentials).subscribe({
      next: (response) => {
        this.isSubmitting = false;

        const returnUrl =
          this.route.snapshot.queryParamMap.get('returnUrl') ||
          this.route.snapshot.queryParamMap.get('redirectUrl');

        if (returnUrl) {
          this.router.navigateByUrl(returnUrl);
          return;
        }

        if (response.role === AuthRoles.Administrator) {
          this.router.navigate(['/admin/dashboard']);
        } else {
          this.router.navigate(['/customer/dashboard']);
        }
      },
      error: (error: unknown) => {
        this.isSubmitting = false;
        this.handleLoginError(error);
      }
    });
  }

  private handleLoginError(error: unknown): void {
    if (error instanceof HttpErrorResponse) {
      if (error.status === 401) {
        this.errorMessage =
          'The email or password you entered is incorrect. Please try again.';
        return;
      }

      if (error.status === 403) {
        const backendMessage = error.error?.message;
        if (typeof backendMessage === 'string' && backendMessage.trim()) {
          this.errorMessage = backendMessage;
        } else {
          this.errorMessage =
            'Access denied. Please verify your email before signing in or contact support.';
        }
        return;
      }

      if (error.status === 0) {
        this.errorMessage =
          'Unable to reach the authentication server. Please check your connection and try again.';
        return;
      }

      this.errorMessage =
        'An unexpected error occurred during sign in. Please try again.';
      return;
    }

    this.errorMessage =
      'An unexpected error occurred. Please try again.';
  }
}
