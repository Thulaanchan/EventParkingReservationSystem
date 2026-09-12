import { CommonModule } from '@angular/common';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { RegisterRequest } from '../../../../core/models/auth/register-request.model';

export interface CustomerDto {
  customerId: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  isActive: boolean;
  isEmailVerified: boolean;
  bookingCount: number;
  createdAt: string;
  updatedAt?: string | null;
}

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

export const passwordMatchValidator: ValidatorFn = (
  control: AbstractControl
): ValidationErrors | null => {
  const password = control.get('password')?.value;
  const confirmPassword = control.get('confirmPassword')?.value;

  if (!password || !confirmPassword) {
    return null;
  }

  return password === confirmPassword ? null : { passwordMismatch: true };
};

@Component({
  selector: 'app-register-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register-page.component.html',
  styleUrl: './register-page.component.css'
})
export class RegisterPageComponent {
  private readonly fb = inject(FormBuilder);
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  isSubmitting = false;
  showPassword = false;
  showConfirmPassword = false;
  errorMessage: string | null = null;

  readonly registerForm: FormGroup = this.fb.group(
    {
      firstName: [
        '',
        [Validators.required, Validators.maxLength(50)]
      ],
      lastName: [
        '',
        [Validators.required, Validators.maxLength(50)]
      ],
      email: [
        '',
        [
          Validators.required,
          Validators.email,
          Validators.maxLength(150)
        ]
      ],
      phone: [
        '',
        [Validators.maxLength(25)]
      ],
      password: [
        '',
        [
          Validators.required,
          Validators.minLength(8),
          passwordComplexityValidator
        ]
      ],
      confirmPassword: [
        '',
        [Validators.required]
      ],
      termsAccepted: [
        false,
        [Validators.requiredTrue]
      ]
    },
    { validators: [passwordMatchValidator] }
  );

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  get firstNameControl(): AbstractControl | null {
    return this.registerForm.get('firstName');
  }

  get lastNameControl(): AbstractControl | null {
    return this.registerForm.get('lastName');
  }

  get emailControl(): AbstractControl | null {
    return this.registerForm.get('email');
  }

  get phoneControl(): AbstractControl | null {
    return this.registerForm.get('phone');
  }

  get passwordControl(): AbstractControl | null {
    return this.registerForm.get('password');
  }

  get confirmPasswordControl(): AbstractControl | null {
    return this.registerForm.get('confirmPassword');
  }

  get termsAcceptedControl(): AbstractControl | null {
    return this.registerForm.get('termsAccepted');
  }

  isFieldInvalid(controlName: string): boolean {
    const control = this.registerForm.get(controlName);
    if (!control) {
      return false;
    }
    return control.invalid && (control.touched || control.dirty);
  }

  hasPasswordMismatch(): boolean {
    const confirm = this.confirmPasswordControl;
    return (
      !!this.registerForm.errors?.['passwordMismatch'] &&
      !!confirm &&
      (confirm.touched || confirm.dirty)
    );
  }

  onSubmit(): void {
    if (this.isSubmitting) {
      return;
    }

    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = null;

    const formValue = this.registerForm.value;
    const requestPayload: RegisterRequest = {
      firstName: formValue.firstName?.trim() || '',
      lastName: formValue.lastName?.trim() || '',
      email: formValue.email?.trim() || '',
      phone: formValue.phone?.trim() ? formValue.phone.trim() : null,
      password: formValue.password || '',
      confirmPassword: formValue.confirmPassword || ''
    };

    this.http
      .post<CustomerDto>('/api/customers/register', requestPayload)
      .subscribe({
        next: () => {
          this.isSubmitting = false;
          // Do NOT authenticate automatically or create fake JWT session.
          // Redirect to verification next step screen.
          this.router.navigate(['/auth/verify-email-sent'], {
            queryParams: { email: requestPayload.email }
          });
        },
        error: (error: unknown) => {
          this.isSubmitting = false;
          this.handleRegisterError(error);
        }
      });
  }

  private handleRegisterError(error: unknown): void {
    if (error instanceof HttpErrorResponse) {
      if (error.status === 409) {
        const backendMessage = error.error?.message;
        if (typeof backendMessage === 'string' && backendMessage.trim()) {
          this.errorMessage = backendMessage;
        } else {
          this.errorMessage =
            'An account with this email address already exists. Please sign in or use a different email.';
        }
        return;
      }

      if (error.status === 400) {
        const backendMessage = error.error?.message;
        if (typeof backendMessage === 'string' && backendMessage.trim()) {
          this.errorMessage = backendMessage;
        } else {
          this.errorMessage =
            'Please check your registration details and ensure all requirements are met.';
        }
        return;
      }

      if (error.status === 0) {
        this.errorMessage =
          'Unable to reach the server. Please check your connection and try again.';
        return;
      }

      this.errorMessage =
        'An unexpected error occurred during registration. Please try again later.';
      return;
    }

    this.errorMessage =
      'An unexpected error occurred. Please try again.';
  }
}
