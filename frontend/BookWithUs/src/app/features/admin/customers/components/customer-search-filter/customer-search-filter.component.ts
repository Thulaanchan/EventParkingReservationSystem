import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  inject,
  signal
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';

export type CustomerStatusFilter = 'ALL' | 'ACTIVE' | 'INACTIVE';

@Component({
  selector: 'app-customer-search-filter',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './customer-search-filter.component.html',
  styleUrl: './customer-search-filter.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CustomerSearchFilterComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly searchSubject = new Subject<string>();

  @Input() initialSearch = '';
  @Input() isLoading = false;

  @Output() readonly searchChange = new EventEmitter<string>();
  @Output() readonly statusFilterChange = new EventEmitter<CustomerStatusFilter>();

  readonly searchControl = new FormControl<string>('', { nonNullable: true });
  readonly activeFilter = signal<CustomerStatusFilter>('ALL');

  ngOnInit(): void {
    if (this.initialSearch) {
      this.searchControl.setValue(this.initialSearch, { emitEvent: false });
    }

    // Debounce search input to avoid redundant server calls
    this.searchSubject
      .pipe(
        debounceTime(350),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((val) => {
        this.searchChange.emit(val.trim());
      });
  }

  onInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchSubject.next(input.value);
  }

  onClearSearch(): void {
    this.searchControl.setValue('');
    this.searchSubject.next('');
  }

  onSelectFilter(filter: CustomerStatusFilter): void {
    if (this.activeFilter() === filter) return;
    this.activeFilter.set(filter);
    this.statusFilterChange.emit(filter);
  }
}
