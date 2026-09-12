import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, inject } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Subscription, interval } from 'rxjs';
import { AuthService } from '../../../../core/services/auth/auth.service';

@Component({
  selector: 'app-forgot-password-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './forgot-password-page.component.html',
  styleUrl: './forgot-password-page.component.css'
})
export class ForgotPasswordPageComponent implements OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);

  isSubmitting = false;
  isSubmitted = false;
  submittedEmail = '';

  errorMessage: string | null = null;
  successMessage: string | null = null;

  cooldownSeconds = 0;
  private timerSubscription?: Subscription;

  readonly forgotPasswordForm: FormGroup = this.fb.group({
    email: [
      '',
      [Validators.required, Validators.email, Validators.maxLength(150)]
    ]
  });

  ngOnDestroy(): void {
    this.timerSubscription?.unsubscribe();
  }

  get emailControl(): AbstractControl | null {
    return this.forgotPasswordForm.get('email');
  }

  isFieldInvalid(fieldName: string): boolean {
    const control = this.forgotPasswordForm.get(fieldName);
    return !!(control && control.invalid && (control.touched || control.dirty));
  }

  onSubmit(): void {
    if (this.forgotPasswordForm.invalid) {
      this.forgotPasswordForm.markAllAsTouched();
      return;
    }

    const emailValue: string = (this.emailControl?.value || '').trim();
    if (!emailValue) {
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = null;
    this.successMessage = null;

    this.authService.forgotPassword({ email: emailValue }).subscribe({
      next: (res) => {
        this.isSubmitting = false;
        this.isSubmitted = true;
        this.submittedEmail = emailValue;
        this.successMessage =
          res.message ||
          'If an account exists with that email, we have sent instructions to reset your password.';
        this.startCooldown(60);
      },
      error: (error: unknown) => {
        this.isSubmitting = false;
        if (error instanceof HttpErrorResponse) {
          if (error.status === 0) {
            this.errorMessage =
              'Unable to reach the server. Please check your connection and try again.';
            return;
          }
          if (error.status === 400 || error.status === 404) {
            this.errorMessage =
              error.error?.message ||
              'Unable to process password reset request. Please check the email address.';
            return;
          }
        }
        this.errorMessage =
          'An unexpected error occurred while requesting a password reset. Please try again.';
      }
    });
  }

  onResend(): void {
    if (!this.submittedEmail || this.isSubmitting || this.cooldownSeconds > 0) {
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = null;

    this.authService
      .forgotPassword({ email: this.submittedEmail })
      .subscribe({
        next: (res) => {
          this.isSubmitting = false;
          this.successMessage =
            res.message ||
            'Password reset link resent! Please check your inbox and spam folder.';
          this.startCooldown(60);
        },
        error: (error: unknown) => {
          this.isSubmitting = false;
          if (error instanceof HttpErrorResponse && error.status === 0) {
            this.errorMessage =
              'Unable to reach the server. Please check your connection.';
            return;
          }
          this.errorMessage =
            'Unable to resend reset link at this moment. Please try again later.';
        }
      });
  }

  onTryAnotherEmail(): void {
    this.isSubmitted = false;
    this.submittedEmail = '';
    this.errorMessage = null;
    this.successMessage = null;
    this.forgotPasswordForm.reset();
  }

  private startCooldown(seconds: number): void {
    this.cooldownSeconds = seconds;
    this.timerSubscription?.unsubscribe();
    this.timerSubscription = interval(1000).subscribe(() => {
      this.cooldownSeconds--;
      if (this.cooldownSeconds <= 0) {
        this.timerSubscription?.unsubscribe();
      }
    });
  }
}
