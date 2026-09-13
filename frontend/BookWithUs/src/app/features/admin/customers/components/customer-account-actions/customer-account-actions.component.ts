import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  HostListener,
  Input,
  OnDestroy,
  Output,
  computed,
  inject,
  signal
} from '@angular/core';
import { Subscription } from 'rxjs';
import { CustomerService } from '../../../../../core/services/customers/customer.service';

export type DeactivateState = 'idle' | 'confirming' | 'submitting' | 'error' | 'success';

@Component({
  selector: 'app-customer-account-actions',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './customer-account-actions.component.html',
  styleUrl: './customer-account-actions.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CustomerAccountActionsComponent implements OnDestroy {
  private readonly customerService = inject(CustomerService);
  private sub?: Subscription;

  @Input({ required: true }) customerId!: number;
  @Input() customerName = '';
  @Input() isActive = true;

  @Output() readonly deactivationCompleted = new EventEmitter<{ message: string }>();
  @Output() readonly refreshRequested = new EventEmitter<void>();

  readonly state = signal<DeactivateState>('idle');
  readonly isSubmitting = signal<boolean>(false);
  readonly errorMessage = signal<string | null>(null);
  readonly successMessage = signal<string | null>(null);

  @HostListener('keydown.escape')
  onEscape(): void {
    if (this.state() === 'confirming' && !this.isSubmitting()) {
      this.onDismissModal();
    }
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  onOpenConfirmation(): void {
    if (!this.isActive || this.isSubmitting()) return;
    this.errorMessage.set(null);
    this.successMessage.set(null);
    this.state.set('confirming');
  }

  onDismissModal(): void {
    if (this.isSubmitting()) return;
    this.state.set('idle');
    this.errorMessage.set(null);
  }

  onConfirmDeactivation(): void {
    if (this.isSubmitting() || !this.isActive) return;

    this.isSubmitting.set(true);
    this.state.set('submitting');
    this.errorMessage.set(null);

    this.sub?.unsubscribe();
    this.sub = this.customerService.deactivateCustomer(this.customerId).subscribe({
      next: (res) => {
        this.isSubmitting.set(false);
        this.state.set('success');
        this.successMessage.set(res.message || 'Customer account deactivated successfully.');
        this.deactivationCompleted.emit(res);
        this.refreshRequested.emit();
      },
      error: (err: unknown) => {
        this.isSubmitting.set(false);
        this.state.set('error');

        if (err instanceof HttpErrorResponse) {
          if (err.status === 401) {
            this.errorMessage.set('Your session has expired. Please sign in again.');
            return;
          }
          if (err.status === 403) {
            this.errorMessage.set('Administrator access is required to deactivate accounts.');
            return;
          }
          if (err.status === 404) {
            this.errorMessage.set('Customer was not found or has already been removed.');
            this.refreshRequested.emit();
            return;
          }
          if (err.status === 409) {
            this.errorMessage.set('Cannot deactivate account due to pending active operations.');
            return;
          }
          if (err.status === 0 || err.status >= 500) {
            this.errorMessage.set('Unable to deactivate customer account. Please try again.');
            return;
          }
        }

        this.errorMessage.set('Unable to deactivate customer account. Please try again.');
      }
    });
  }

  onCloseNotice(): void {
    this.state.set('idle');
    this.errorMessage.set(null);
    this.successMessage.set(null);
  }
}
