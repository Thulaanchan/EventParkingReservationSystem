import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Customer } from '../../../../core/models/customers/customer.model';
import { UpdateCustomerRequest } from '../../../../core/models/customers/update-customer-request.model';
import { AuthSessionService } from '../../../../core/services/auth/auth-session.service';
import { CustomerService } from '../../../../core/services/customers/customer.service';
import { AccountSecurityCardComponent } from '../../components/account-security-card/account-security-card.component';
import { PersonalInformationFormComponent } from '../../components/personal-information-form/personal-information-form.component';
import { ProfileSummaryCardComponent } from '../../components/profile-summary-card/profile-summary-card.component';

@Component({
  selector: 'app-profile-page',
  standalone: true,
  imports: [
    CommonModule,
    ProfileSummaryCardComponent,
    PersonalInformationFormComponent,
    AccountSecurityCardComponent
  ],
  templateUrl: './profile-page.component.html',
  styleUrl: './profile-page.component.css'
})
export class ProfilePageComponent implements OnInit {
  private readonly customerService = inject(CustomerService);
  private readonly authSessionService = inject(AuthSessionService);
  private readonly router = inject(Router);

  readonly customer = signal<Customer | null>(null);
  readonly isLoading = signal<boolean>(true);
  readonly isSaving = signal<boolean>(false);
  readonly pageErrorMessage = signal<string | null>(null);
  readonly formErrorMessage = signal<string | null>(null);
  readonly successMessage = signal<string | null>(null);

  ngOnInit(): void {
    const user = this.authSessionService.currentUser();
    const customerId = user?.customerId ?? user?.userId;

    if (!customerId) {
      this.isLoading.set(false);
      this.pageErrorMessage.set('You must be signed in to view your profile.');
      this.router.navigate(['/auth/login']);
      return;
    }

    this.loadProfile(customerId);
  }

  loadProfile(customerId: number): void {
    this.isLoading.set(true);
    this.pageErrorMessage.set(null);

    this.customerService.getCustomerById(customerId).subscribe({
      next: (data) => {
        this.customer.set(data);
        this.isLoading.set(false);
      },
      error: (error: unknown) => {
        this.isLoading.set(false);
        if (error instanceof HttpErrorResponse) {
          if (error.status === 401) {
            this.pageErrorMessage.set(
              'Your session has expired. Please sign in again.'
            );
            return;
          }
          if (error.status === 403) {
            this.pageErrorMessage.set(
              'You do not have permission to view this customer profile.'
            );
            return;
          }
          if (error.status === 404) {
            this.pageErrorMessage.set(
              'Customer profile could not be found.'
            );
            return;
          }
          if (error.status === 0) {
            this.pageErrorMessage.set(
              'Unable to connect to the server. Please check your network connection.'
            );
            return;
          }
        }
        this.pageErrorMessage.set(
          'Failed to load profile details. Please try again.'
        );
      }
    });
  }

  onUpdateProfile(request: UpdateCustomerRequest): void {
    const user = this.authSessionService.currentUser();
    const customerId = user?.customerId ?? user?.userId;

    if (!customerId) {
      this.formErrorMessage.set('Session expired. Please sign in again.');
      return;
    }

    this.isSaving.set(true);
    this.formErrorMessage.set(null);
    this.successMessage.set(null);

    this.customerService.updateCustomer(customerId, request).subscribe({
      next: (updatedCustomer) => {
        this.isSaving.set(false);
        this.customer.set(updatedCustomer);
        this.successMessage.set('Profile updated successfully.');
      },
      error: (error: unknown) => {
        this.isSaving.set(false);
        if (error instanceof HttpErrorResponse) {
          if (error.status === 400) {
            this.formErrorMessage.set(
              error.error?.message ||
                'Please check your inputs and ensure all required fields are valid.'
            );
            return;
          }
          if (error.status === 401) {
            this.formErrorMessage.set(
              'Your session has expired. Please sign in again.'
            );
            return;
          }
          if (error.status === 403) {
            this.formErrorMessage.set(
              'You do not have permission to update this profile.'
            );
            return;
          }
          if (error.status === 404) {
            this.formErrorMessage.set('Customer profile not found.');
            return;
          }
          if (error.status === 409) {
            this.formErrorMessage.set(
              error.error?.message ||
                'This email address is already in use by another account.'
            );
            return;
          }
          if (error.status === 0) {
            this.formErrorMessage.set(
              'Unable to reach the server. Please check your internet connection.'
            );
            return;
          }
        }
        this.formErrorMessage.set(
          'An unexpected error occurred while updating your profile. Please try again.'
        );
      }
    });
  }

  dismissSuccessMessage(): void {
    this.successMessage.set(null);
  }

  retryLoad(): void {
    const user = this.authSessionService.currentUser();
    const customerId = user?.customerId ?? user?.userId;
    if (customerId) {
      this.loadProfile(customerId);
    }
  }
}
