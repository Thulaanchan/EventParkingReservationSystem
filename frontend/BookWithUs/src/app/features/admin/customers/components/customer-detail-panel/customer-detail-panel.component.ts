import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  HostListener,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
  inject,
  signal
} from '@angular/core';
import { Subscription } from 'rxjs';
import { Customer } from '../../../../../core/models/customers/customer.model';
import { CustomerService } from '../../../../../core/services/customers/customer.service';
import { CustomerAccountActionsComponent } from '../customer-account-actions/customer-account-actions.component';
import { CustomerBookingSummaryComponent } from '../customer-booking-summary/customer-booking-summary.component';

export type DetailPanelState = 'loading' | 'error' | 'data';

@Component({
  selector: 'app-customer-detail-panel',
  standalone: true,
  imports: [
    CommonModule,
    CustomerAccountActionsComponent,
    CustomerBookingSummaryComponent
  ],
  templateUrl: './customer-detail-panel.component.html',
  styleUrl: './customer-detail-panel.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CustomerDetailPanelComponent implements OnChanges, OnDestroy {
  private readonly customerService = inject(CustomerService);
  private sub?: Subscription;

  @Input() customerId: number | null = null;
  @Input() isOpen = false;

  @Output() readonly closePanel = new EventEmitter<void>();
  @Output() readonly customerDeactivated = new EventEmitter<void>();

  readonly state = signal<DetailPanelState>('loading');
  readonly customer = signal<Customer | null>(null);
  readonly errorMessage = signal<string | null>(null);

  @HostListener('keydown.escape')
  onEscape(): void {
    if (this.isOpen) {
      this.onClose();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['customerId'] || (changes['isOpen'] && this.isOpen)) {
      if (this.customerId && this.isOpen) {
        this.fetchCustomerDetails(this.customerId);
      }
    }
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  onClose(): void {
    this.closePanel.emit();
  }

  onRetry(): void {
    if (this.customerId) {
      this.fetchCustomerDetails(this.customerId);
    }
  }

  onDeactivationCompleted(): void {
    this.customerDeactivated.emit();
    if (this.customerId) {
      this.fetchCustomerDetails(this.customerId);
    }
  }

  private fetchCustomerDetails(id: number): void {
    this.state.set('loading');
    this.errorMessage.set(null);

    this.sub?.unsubscribe();
    this.sub = this.customerService.getCustomerById(id).subscribe({
      next: (data) => {
        this.customer.set(data);
        this.state.set('data');
      },
      error: (err: unknown) => {
        this.state.set('error');

        if (err instanceof HttpErrorResponse) {
          if (err.status === 401) {
            this.errorMessage.set('Your session has expired. Please sign in again.');
            return;
          }
          if (err.status === 403) {
            this.errorMessage.set('Administrator access is required to view customer details.');
            return;
          }
          if (err.status === 404) {
            this.errorMessage.set('Customer details could not be found.');
            return;
          }
        }

        this.errorMessage.set('Unable to load customer details. Please try again.');
      }
    });
  }
}
