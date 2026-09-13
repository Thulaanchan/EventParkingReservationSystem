import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
  computed,
  inject,
  signal
} from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { PagedResult } from '../../../../../core/models/common/paged-result.model';
import { CustomerSummary } from '../../../../../core/models/customers/customer-summary.model';
import { CustomerService } from '../../../../../core/services/customers/customer.service';
import { CustomerDetailPanelComponent } from '../../components/customer-detail-panel/customer-detail-panel.component';
import {
  CustomerSearchFilterComponent,
  CustomerStatusFilter
} from '../../components/customer-search-filter/customer-search-filter.component';
import { CustomerStatsComponent } from '../../components/customer-stats/customer-stats.component';
import { CustomerTableComponent } from '../../components/customer-table/customer-table.component';

export type CustomerPageViewState = 'loading' | 'error' | 'empty' | 'data';

@Component({
  selector: 'app-customer-management-page',
  standalone: true,
  imports: [
    CommonModule,
    CustomerStatsComponent,
    CustomerSearchFilterComponent,
    CustomerTableComponent,
    CustomerDetailPanelComponent
  ],
  templateUrl: './customer-management-page.component.html',
  styleUrl: './customer-management-page.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CustomerManagementPageComponent implements OnInit, OnDestroy {
  private readonly customerService = inject(CustomerService);
  private readonly router = inject(Router);
  private sub?: Subscription;

  // Search, filter, and pagination signals
  readonly searchQuery = signal<string>('');
  readonly statusFilter = signal<CustomerStatusFilter>('ALL');
  readonly currentPage = signal<number>(1);
  readonly pageSize = signal<number>(10);

  // State signals
  readonly isLoading = signal<boolean>(true);
  readonly errorMessage = signal<string | null>(null);
  readonly isSessionExpired = signal<boolean>(false);
  readonly isAccessDenied = signal<boolean>(false);
  readonly pagedResult = signal<PagedResult<CustomerSummary> | null>(null);

  // Selection drawer signal
  readonly selectedCustomerId = signal<number | null>(null);
  readonly isDetailPanelOpen = signal<boolean>(false);

  // Computed: filtered customer items
  readonly displayedCustomers = computed<CustomerSummary[]>(() => {
    const result = this.pagedResult();
    if (!result) return [];

    const filter = this.statusFilter();
    if (filter === 'ACTIVE') {
      return result.items.filter((c) => c.isActive);
    }
    if (filter === 'INACTIVE') {
      return result.items.filter((c) => !c.isActive);
    }
    return result.items;
  });

  // Computed summary metrics
  readonly totalCustomersCount = computed<number>(() => {
    return this.pagedResult()?.totalCount ?? 0;
  });

  readonly pageActiveCount = computed<number>(() => {
    return (this.pagedResult()?.items ?? []).filter((c) => c.isActive).length;
  });

  readonly pageVerifiedCount = computed<number>(() => {
    return (this.pagedResult()?.items ?? []).filter((c) => c.isEmailVerified).length;
  });

  readonly totalPages = computed<number>(() => {
    return this.pagedResult()?.totalPages ?? 1;
  });

  // Mutually exclusive view state: loading | error | empty | data
  readonly viewState = computed<CustomerPageViewState>(() => {
    if (this.isLoading()) {
      return 'loading';
    }
    if (this.errorMessage()) {
      return 'error';
    }
    if (this.displayedCustomers().length === 0) {
      return 'empty';
    }
    return 'data';
  });

  ngOnInit(): void {
    this.loadCustomers();
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  onSearchChange(query: string): void {
    if (this.searchQuery() === query) return;
    this.searchQuery.set(query);
    this.currentPage.set(1);
    this.loadCustomers();
  }

  onStatusFilterChange(filter: CustomerStatusFilter): void {
    this.statusFilter.set(filter);
  }

  onPageChange(page: number): void {
    if (this.currentPage() === page) return;
    this.currentPage.set(page);
    this.loadCustomers();
  }

  onPageSizeChange(size: number): void {
    if (this.pageSize() === size) return;
    this.pageSize.set(size);
    this.currentPage.set(1);
    this.loadCustomers();
  }

  onCustomerSelected(customer: CustomerSummary): void {
    this.selectedCustomerId.set(customer.customerId);
    this.isDetailPanelOpen.set(true);
  }

  onCloseDetailPanel(): void {
    this.isDetailPanelOpen.set(false);
    this.selectedCustomerId.set(null);
  }

  onCustomerDeactivated(): void {
    // Authoritatively reload list from backend
    this.loadCustomers();
  }

  onRetry(): void {
    this.loadCustomers();
  }

  onClearSearch(): void {
    this.searchQuery.set('');
    this.statusFilter.set('ALL');
    this.currentPage.set(1);
    this.loadCustomers();
  }

  onGoToLogin(): void {
    this.router.navigate(['/auth/login'], { queryParams: { redirectUrl: '/admin/customers' } });
  }

  private loadCustomers(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.isSessionExpired.set(false);
    this.isAccessDenied.set(false);

    this.sub?.unsubscribe();
    this.sub = this.customerService
      .searchCustomers(this.searchQuery(), this.currentPage(), this.pageSize())
      .subscribe({
        next: (result) => {
          this.isLoading.set(false);
          this.pagedResult.set(result);
        },
        error: (err: unknown) => {
          this.isLoading.set(false);

          if (err instanceof HttpErrorResponse) {
            if (err.status === 401) {
              this.isSessionExpired.set(true);
              this.errorMessage.set('Your session has expired. Please sign in again.');
              return;
            }
            if (err.status === 403) {
              this.isAccessDenied.set(true);
              this.errorMessage.set('Administrator access is required to view customer management.');
              return;
            }
            if (err.status === 0 || err.status >= 500) {
              this.errorMessage.set('Unable to connect to the customer service. Please check your network and try again.');
              return;
            }
          }

          this.errorMessage.set('An error occurred while loading customers. Please try again.');
        }
      });
  }
}
