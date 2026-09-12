import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Subscription, interval } from 'rxjs';
import { AuthService } from '../../../../core/services/auth/auth.service';

@Component({
  selector: 'app-verify-email-sent-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './verify-email-sent-page.component.html',
  styleUrl: './verify-email-sent-page.component.css'
})
export class VerifyEmailSentPageComponent implements OnInit, OnDestroy {
  private readonly authService = inject(AuthService);
  private readonly route = inject(ActivatedRoute);

  email = '';
  token = '';

  isVerifying = false;
  isVerified = false;
  isResending = false;

  successMessage: string | null = null;
  errorMessage: string | null = null;

  cooldownSeconds = 0;
  private timerSubscription?: Subscription;

  ngOnInit(): void {
    this.email = this.route.snapshot.queryParamMap.get('email') || '';
    this.token = this.route.snapshot.queryParamMap.get('token') || '';

    // If both email and token are provided, automatically trigger verification
    if (this.email && this.token) {
      this.verifyEmail();
    }
  }

  ngOnDestroy(): void {
    this.timerSubscription?.unsubscribe();
  }

  get maskedEmail(): string {
    if (!this.email || !this.email.includes('@')) {
      return this.email || 'your email';
    }
    const [local, domain] = this.email.split('@');
    if (local.length <= 4) {
      return `${local}••••@${domain}`;
    }
    return `${local.substring(0, 4)}••••@${domain}`;
  }

  verifyEmail(): void {
    if (!this.email || !this.token || this.isVerifying) {
      return;
    }

    this.isVerifying = true;
    this.errorMessage = null;
    this.successMessage = null;

    this.authService
      .verifyEmail({ email: this.email, token: this.token })
      .subscribe({
        next: (res) => {
          this.isVerifying = false;
          this.isVerified = true;
          this.successMessage =
            res.message || 'Email verified successfully. You can now sign in.';
        },
        error: (error: unknown) => {
          this.isVerifying = false;
          if (error instanceof HttpErrorResponse) {
            if (error.status === 400) {
              this.errorMessage =
                error.error?.message ||
                'The email verification link is invalid or has expired.';
              return;
            }
            if (error.status === 0) {
              this.errorMessage =
                'Unable to reach the server. Please check your connection and try again.';
              return;
            }
          }
          this.errorMessage =
            'Verification failed. The link may have expired or is invalid.';
        }
      });
  }

  isEditingEmail = false;

  toggleEditEmail(): void {
    this.isEditingEmail = !this.isEditingEmail;
  }

  onResend(): void {
    if (!this.email || this.isResending || this.cooldownSeconds > 0) {
      return;
    }

    this.isResending = true;
    this.errorMessage = null;
    this.successMessage = null;

    this.authService.resendVerification({ email: this.email }).subscribe({
      next: (res) => {
        this.isResending = false;
        this.successMessage =
          res.message ||
          'A new verification email has been sent. Please check your inbox.';
        this.startCooldown(60);
      },
      error: (error: unknown) => {
        this.isResending = false;
        if (error instanceof HttpErrorResponse) {
          if (error.status === 400) {
            this.errorMessage =
              error.error?.message ||
              'Unable to resend verification email. Please check your email address.';
            return;
          }
          if (error.status === 0) {
            this.errorMessage =
              'Unable to reach the server. Please check your connection.';
            return;
          }
        }
        this.errorMessage =
          'Unable to resend verification email at this time. Please try again later.';
      }
    });
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
