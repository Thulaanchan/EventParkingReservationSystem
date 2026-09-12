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
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { BookingStatus } from '../../../../../core/models/bookings/booking-status.model';
import { BookingSummary } from '../../../../../core/models/bookings/booking-summary.model';
import { BookingService } from '../../../../../core/services/bookings/booking.service';
import { BookingAdminDetailPanelComponent } from '../../components/booking-admin-detail-panel/booking-admin-detail-panel.component';
import {
  BookingAdminFilterComponent,
  BookingAdminFilterTab
} from '../../components/booking-admin-filter/booking-admin-filter.component';
import { BookingAdminStatsComponent } from '../../components/booking-admin-stats/booking-admin-stats.component';
import { BookingAdminTableComponent } from '../../components/booking-admin-table/booking-admin-table.component';

export type AdminBookingViewState = 'no-event-selected' | 'loading' | 'error' | 'empty' | 'data';

@Component({
  selector: 'app-booking-management-page',
  standalone: true,
  imports: [
    CommonModule,
    BookingAdminStatsComponent,
    BookingAdminFilterComponent,
    BookingAdminTableComponent,
    BookingAdminDetailPanelComponent
  ],
  templateUrl: './booking-management-page.component.html',
  styleUrl: './booking-management-page.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BookingManagementPageComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly bookingService = inject(BookingService);
  private sub?: Subscription;

  // Selected event ID signal
  readonly selectedEventId = signal<number | null>(null);

  // Raw bookings loaded from backend for the selected event
  readonly rawBookings = signal<BookingSummary[]>([]);

  // Filter signals
  readonly activeStatusFilter = signal<BookingAdminFilterTab>('ALL');
  readonly searchQuery = signal<string>('');

  // UI state signals
  readonly isLoading = signal<boolean>(false);
  readonly errorMessage = signal<string | null>(null);
  readonly isSessionExpired = signal<boolean>(false);
  readonly isAccessDenied = signal<boolean>(false);

  // Detail panel signals
  readonly selectedBookingId = signal<number | null>(null);
  readonly isDetailPanelOpen = signal<boolean>(false);

  // Computed: Client-side filtered bookings for the selected event
  readonly filteredBookings = computed<BookingSummary[]>(() => {
    let list = this.rawBookings();
    const status = this.activeStatusFilter();
    const query = this.searchQuery().toLowerCase().trim();

    if (status !== 'ALL') {
      list = list.filter((b) => b.bookingStatus === status);
    }

    if (query) {
      list = list.filter(
        (b) =>
          b.bookingNumber.toLowerCase().includes(query) ||
          b.customerId.toString().includes(query) ||
          b.venueName.toLowerCase().includes(query)
      );
    }

    return list;
  });

  // Computed stats derived from the selected event's bookings
  readonly totalBookingsCount = computed<number>(() => this.rawBookings().length);

  readonly confirmedBookingsCount = computed<number>(() => {
    return this.rawBookings().filter((b) => b.bookingStatus === 'Confirmed').length;
  });

  readonly pendingBookingsCount = computed<number>(() => {
    return this.rawBookings().filter((b) => b.bookingStatus === 'Pending').length;
  });

  readonly cancelledOrExpiredCount = computed<number>(() => {
    return this.rawBookings().filter(
      (b) => b.bookingStatus === 'Cancelled' || b.bookingStatus === 'Expired'
    ).length;
  });

  readonly totalRevenue = computed<number>(() => {
    return this.rawBookings()
      .filter((b) => b.bookingStatus === 'Confirmed')
      .reduce((sum, b) => sum + (b.totalAmount || 0), 0);
  });

  // Mutually exclusive view state: no-event-selected | loading | error | empty | data
  readonly viewState = computed<AdminBookingViewState>(() => {
    if (!this.selectedEventId()) {
      return 'no-event-selected';
    }
    if (this.isLoading()) {
      return 'loading';
    }
    if (this.errorMessage()) {
      return 'error';
    }
    if (this.filteredBookings().length === 0) {
      return 'empty';
    }
    return 'data';
  });

  ngOnInit(): void {
    // Check optional query param for preselected event
    const rawParam = this.route.snapshot.queryParamMap.get('eventId');
    if (rawParam) {
      const parsedId = parseInt(rawParam, 10);
      if (!isNaN(parsedId) && parsedId > 0) {
        this.onSelectEvent(parsedId);
      }
    }
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  onSelectEvent(eventId: number): void {
    if (this.selectedEventId() === eventId && this.rawBookings().length > 0) {
      return;
    }

    this.selectedEventId.set(eventId);
    this.rawBookings.set([]);
    this.activeStatusFilter.set('ALL');
    this.searchQuery.set('');
    this.loadEventBookings(eventId);
  }

  onStatusFilterSelected(tab: BookingAdminFilterTab): void {
    this.activeStatusFilter.set(tab);
  }

  onSearchQueryChange(query: string): void {
    this.searchQuery.set(query);
  }

  onBookingSelected(booking: BookingSummary): void {
    this.selectedBookingId.set(booking.bookingId);
    this.isDetailPanelOpen.set(true);
  }

  onCloseDetailPanel(): void {
    this.isDetailPanelOpen.set(false);
    this.selectedBookingId.set(null);
  }

  onRetry(): void {
    const id = this.selectedEventId();
    if (id) {
      this.loadEventBookings(id);
    }
  }

  onGoToLogin(): void {
    this.router.navigate(['/auth/login'], { queryParams: { redirectUrl: '/admin/bookings' } });
  }

  private loadEventBookings(eventId: number): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.isSessionExpired.set(false);
    this.isAccessDenied.set(false);

    this.sub?.unsubscribe();
    this.sub = this.bookingService.getEventBookings(eventId).subscribe({
      next: (data) => {
        this.isLoading.set(false);
        this.rawBookings.set(data);
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
            this.errorMessage.set('Administrator access is required to manage event bookings.');
            return;
          }
          if (err.status === 400) {
            this.errorMessage.set('Invalid event specified. Please enter a valid Event ID.');
            return;
          }
          if (err.status === 404) {
            this.errorMessage.set('The specified event was not found.');
            return;
          }
          if (err.status === 0 || err.status >= 500) {
            this.errorMessage.set('Unable to load bookings right now. Please check your network and try again.');
            return;
          }
        }

        this.errorMessage.set('An error occurred while loading event bookings. Please try again.');
      }
    });
  }
}
