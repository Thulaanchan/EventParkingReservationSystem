import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators
} from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/services/auth/auth.service';

export const passwordComplexityValidator: ValidatorFn = (
  control: AbstractControl
): ValidationErrors | null => {
  const value: string = control.value || '';
  if (!value) {
    return null;
  }

  const hasUpperCase = /[A-Z]/.test(value);
  const hasLowerCase = /[a-z]/.test(value);
  const hasNumber = /\d/.test(value);
  const hasSpecialChar = /[^A-Za-z0-9]/.test(value);

  const errors: ValidationErrors = {};
  if (!hasUpperCase) {
    errors['missingUpperCase'] = true;
  }
  if (!hasLowerCase) {
    errors['missingLowerCase'] = true;
  }
  if (!hasNumber) {
    errors['missingNumber'] = true;
  }
  if (!hasSpecialChar) {
    errors['missingSpecialChar'] = true;
  }

  return Object.keys(errors).length > 0 ? errors : null;
};

export const resetPasswordMatchValidator: ValidatorFn = (
  control: AbstractControl
): ValidationErrors | null => {
  const newPassword = control.get('newPassword')?.value;
  const confirmNewPassword = control.get('confirmNewPassword')?.value;

  if (!newPassword || !confirmNewPassword) {
    return null;
  }

  return newPassword === confirmNewPassword ? null : { passwordMismatch: true };
};

@Component({
  selector: 'app-reset-password-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './reset-password-page.component.html',
  styleUrl: './reset-password-page.component.css'
})
export class ResetPasswordPageComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly authService = inject(AuthService);

  isSubmitting = false;
  isSuccess = false;

  hasEmailParam = false;
  hasTokenParam = false;

  showNewPassword = false;
  showConfirmNewPassword = false;

  errorMessage: string | null = null;
  successMessage: string | null = null;

  readonly resetPasswordForm: FormGroup = this.fb.group(
    {
      email: ['', [Validators.required, Validators.email]],
      token: ['', [Validators.required]],
      newPassword: [
        '',
        [
          Validators.required,
          Validators.minLength(8),
          passwordComplexityValidator
        ]
      ],
      confirmNewPassword: ['', [Validators.required]]
    },
    { validators: [resetPasswordMatchValidator] }
  );

  ngOnInit(): void {
    const emailParam =
      this.route.snapshot.queryParamMap.get('email') ||
      this.route.snapshot.queryParamMap.get('Email') ||
      '';
    const tokenParam =
      this.route.snapshot.queryParamMap.get('token') ||
      this.route.snapshot.queryParamMap.get('Token') ||
      '';

    if (emailParam) {
      this.resetPasswordForm.patchValue({ email: emailParam.trim() });
      this.hasEmailParam = true;
    }

    if (tokenParam) {
      this.resetPasswordForm.patchValue({ token: tokenParam.trim() });
      this.hasTokenParam = true;
    }

    if (!tokenParam) {
      this.errorMessage =
        'Reset token is missing from the link. Please request a new password reset link.';
    }
  }

  // Getters for form controls
  get emailControl(): AbstractControl | null {
    return this.resetPasswordForm.get('email');
  }

  get tokenControl(): AbstractControl | null {
    return this.resetPasswordForm.get('token');
  }

  get newPasswordControl(): AbstractControl | null {
    return this.resetPasswordForm.get('newPassword');
  }

  get confirmNewPasswordControl(): AbstractControl | null {
    return this.resetPasswordForm.get('confirmNewPassword');
  }

  // Password Requirement Checklist Evaluation
  get hasMinLength(): boolean {
    return (this.newPasswordControl?.value || '').length >= 8;
  }

  get hasUpperCase(): boolean {
    return /[A-Z]/.test(this.newPasswordControl?.value || '');
  }

  get hasLowerCase(): boolean {
    return /[a-z]/.test(this.newPasswordControl?.value || '');
  }

  get hasNumber(): boolean {
    return /\d/.test(this.newPasswordControl?.value || '');
  }

  get hasSpecialChar(): boolean {
    return /[^A-Za-z0-9]/.test(this.newPasswordControl?.value || '');
  }

  toggleNewPasswordVisibility(): void {
    this.showNewPassword = !this.showNewPassword;
  }

  toggleConfirmNewPasswordVisibility(): void {
    this.showConfirmNewPassword = !this.showConfirmNewPassword;
  }

  isFieldInvalid(fieldName: string): boolean {
    const control = this.resetPasswordForm.get(fieldName);
    return !!(control && control.invalid && (control.touched || control.dirty));
  }

  get isPasswordMismatch(): boolean {
    const touchedOrDirty =
      this.confirmNewPasswordControl?.touched ||
      this.confirmNewPasswordControl?.dirty;
    return (
      !!touchedOrDirty &&
      this.resetPasswordForm.hasError('passwordMismatch') &&
      !this.confirmNewPasswordControl?.hasError('required')
    );
  }

  onSubmit(): void {
    if (this.resetPasswordForm.invalid) {
      this.resetPasswordForm.markAllAsTouched();
      return;
    }

    const { email, token, newPassword, confirmNewPassword } =
      this.resetPasswordForm.value;

    this.isSubmitting = true;
    this.errorMessage = null;
    this.successMessage = null;

    this.authService
      .resetPassword({
        email: (email || '').trim(),
        token: (token || '').trim(),
        newPassword,
        confirmNewPassword
      })
      .subscribe({
        next: (res) => {
          this.isSubmitting = false;
          this.isSuccess = true;
          this.successMessage =
            res.message ||
            'Your password has been reset successfully! You can now log in.';
          // Explicitly do not authenticate or create session
        },
        error: (error: unknown) => {
          this.isSubmitting = false;
          if (error instanceof HttpErrorResponse) {
            if (error.status === 400) {
              this.errorMessage =
                error.error?.message ||
                'The reset link is invalid or has expired. Please request a new password reset.';
              return;
            }
            if (error.status === 0) {
              this.errorMessage =
                'Unable to connect to the server. Please check your network connection.';
              return;
            }
          }
          this.errorMessage =
            'Unable to reset password. The link may have expired or is invalid.';
        }
      });
  }
}
