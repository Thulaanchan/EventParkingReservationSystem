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
import { BookingStatus } from '../../../../../core/models/bookings/booking-status.model';

export type BookingAdminFilterTab = 'ALL' | BookingStatus;

@Component({
  selector: 'app-booking-admin-filter',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './booking-admin-filter.component.html',
  styleUrl: './booking-admin-filter.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BookingAdminFilterComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly searchSubject = new Subject<string>();

  @Input() selectedEventId: number | null = null;
  @Input() activeFilter: BookingAdminFilterTab = 'ALL';
  @Input() initialSearch = '';
  @Input() isLoading = false;

  @Output() readonly eventIdSelected = new EventEmitter<number>();
  @Output() readonly statusFilterSelected = new EventEmitter<BookingAdminFilterTab>();
  @Output() readonly searchQueryChange = new EventEmitter<string>();

  readonly eventIdControl = new FormControl<number | null>(null);
  readonly searchControl = new FormControl<string>('', { nonNullable: true });

  readonly filterTabs: { label: string; value: BookingAdminFilterTab }[] = [
    { label: 'All Bookings', value: 'ALL' },
    { label: 'Pending', value: 'Pending' },
    { label: 'Confirmed', value: 'Confirmed' },
    { label: 'Cancelled', value: 'Cancelled' },
    { label: 'Expired', value: 'Expired' }
  ];

  ngOnInit(): void {
    if (this.selectedEventId) {
      this.eventIdControl.setValue(this.selectedEventId, { emitEvent: false });
    }
    if (this.initialSearch) {
      this.searchControl.setValue(this.initialSearch, { emitEvent: false });
    }

    this.searchSubject
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((query) => {
        this.searchQueryChange.emit(query.trim());
      });
  }

  onEventSubmit(): void {
    const rawVal = this.eventIdControl.value;
    const id = rawVal ? Number(rawVal) : null;
    if (id && !isNaN(id) && id > 0) {
      this.eventIdSelected.emit(id);
    }
  }

  onSearchInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchSubject.next(input.value);
  }

  onClearSearch(): void {
    this.searchControl.setValue('');
    this.searchSubject.next('');
  }

  onSelectTab(tab: BookingAdminFilterTab): void {
    if (this.activeFilter === tab) return;
    this.statusFilterSelected.emit(tab);
  }
}
