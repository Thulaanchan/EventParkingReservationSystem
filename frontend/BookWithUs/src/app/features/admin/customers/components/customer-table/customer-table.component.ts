import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  computed
} from '@angular/core';
import { CustomerSummary } from '../../../../../core/models/customers/customer-summary.model';
import { CustomerAccountActionsComponent } from '../customer-account-actions/customer-account-actions.component';

@Component({
  selector: 'app-customer-table',
  standalone: true,
  imports: [CommonModule, CustomerAccountActionsComponent],
  templateUrl: './customer-table.component.html',
  styleUrl: './customer-table.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CustomerTableComponent {
  @Input({ required: true }) customers: CustomerSummary[] = [];
  @Input({ required: true }) page = 1;
  @Input({ required: true }) pageSize = 10;
  @Input({ required: true }) totalCount = 0;
  @Input({ required: true }) totalPages = 1;
  @Input() isLoading = false;

  @Output() readonly pageChange = new EventEmitter<number>();
  @Output() readonly pageSizeChange = new EventEmitter<number>();
  @Output() readonly customerSelected = new EventEmitter<CustomerSummary>();
  @Output() readonly customerDeactivated = new EventEmitter<void>();

  // Page range calculations
  get startItem(): number {
    if (this.totalCount === 0) return 0;
    return (this.page - 1) * this.pageSize + 1;
  }

  get endItem(): number {
    const end = this.page * this.pageSize;
    return end > this.totalCount ? this.totalCount : end;
  }

  get canGoPrevious(): boolean {
    return this.page > 1 && !this.isLoading;
  }

  get canGoNext(): boolean {
    return this.page < this.totalPages && !this.isLoading;
  }

  onPreviousPage(): void {
    if (this.canGoPrevious) {
      this.pageChange.emit(this.page - 1);
    }
  }

  onNextPage(): void {
    if (this.canGoNext) {
      this.pageChange.emit(this.page + 1);
    }
  }

  onSelectPage(targetPage: number): void {
    if (targetPage !== this.page && targetPage >= 1 && targetPage <= this.totalPages && !this.isLoading) {
      this.pageChange.emit(targetPage);
    }
  }

  onPageSizeSelected(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const size = parseInt(select.value, 10);
    if (!isNaN(size) && size > 0 && size !== this.pageSize) {
      this.pageSizeChange.emit(size);
    }
  }

  onRowClick(customer: CustomerSummary): void {
    this.customerSelected.emit(customer);
  }

  onDeactivationDone(): void {
    this.customerDeactivated.emit();
  }
}
