import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { BookingStatus } from '../../../../core/models/bookings/booking-status.model';
import { BookingSummary } from '../../../../core/models/bookings/booking-summary.model';
import { AuthSessionService } from '../../../../core/services/auth/auth-session.service';
import { BookingService } from '../../../../core/services/bookings/booking.service';
import { BookingCardListComponent } from '../../components/booking-card-list/booking-card-list.component';
import {
  BOOKING_FILTER_TABS,
  BookingFilterTab,
  BookingFilterTabsComponent
} from '../../components/booking-filter-tabs/booking-filter-tabs.component';

export type BookingsViewState = 'loading' | 'error' | 'empty' | 'data';

@Component({
  selector: 'app-my-bookings-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    BookingFilterTabsComponent,
    BookingCardListComponent
  ],
  templateUrl: './my-bookings-page.component.html',
  styleUrl: './my-bookings-page.component.css'
})
export class MyBookingsPageComponent implements OnInit, OnDestroy {
  private readonly bookingService = inject(BookingService);
  private readonly authSessionService = inject(AuthSessionService);
  private readonly router = inject(Router);

  private sub?: Subscription;

  // Reactive state signals
  readonly isLoading = signal<boolean>(true);
  readonly errorMessage = signal<string | null>(null);
  readonly isSessionExpired = signal<boolean>(false);
  readonly bookings = signal<BookingSummary[]>([]);
  readonly activeFilter = signal<BookingFilterTab>('All');

  // Tab counts
  readonly tabCounts = computed<Record<BookingFilterTab, number>>(() => {
    const all = this.bookings();
    const counts: Record<BookingFilterTab, number> = {
      All: all.length,
      Pending: 0,
      Confirmed: 0,
      Cancelled: 0,
      Expired: 0
    };

    for (const b of all) {
      if (b.bookingStatus in counts) {
        counts[b.bookingStatus]++;
      }
    }
    return counts;
  });

  // Filtered & sorted bookings list (newest first by createdAt / eventDate)
  readonly filteredBookings = computed<BookingSummary[]>(() => {
    const filter = this.activeFilter();
    const raw = this.bookings();

    const matching = filter === 'All'
      ? raw
      : raw.filter((b) => b.bookingStatus === filter);

    return [...matching].sort((a, b) => {
      const timeA = a.createdAt ? new Date(a.createdAt).getTime() : (a.eventDate ? new Date(a.eventDate).getTime() : 0);
      const timeB = b.createdAt ? new Date(b.createdAt).getTime() : (b.eventDate ? new Date(b.eventDate).getTime() : 0);
      return timeB - timeA;
    });
  });

  // Mutually exclusive view state: loading | error | empty | data
  readonly viewState = computed<BookingsViewState>(() => {
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

  // Count header label
  readonly countLabel = computed<string>(() => {
    const count = this.filteredBookings().length;
    return count === 1 ? '1 Booking' : `${count} Bookings`;
  });

  ngOnInit(): void {
    this.loadBookings();
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  onFilterChanged(tab: BookingFilterTab): void {
    this.activeFilter.set(tab);
  }

  onViewDetails(bookingId: number): void {
    this.router.navigate(['/bookings', bookingId]);
  }

  onRetry(): void {
    this.loadBookings();
  }

  onGoToLogin(): void {
    this.router.navigate(['/auth/login'], {
      queryParams: { redirectUrl: '/bookings' }
    });
  }

  loadBookings(): void {
    const user = this.authSessionService.currentUser();
    const customerId = user?.customerId ?? user?.userId;

    if (!customerId) {
      this.isLoading.set(false);
      this.isSessionExpired.set(true);
      this.errorMessage.set('Please sign in to view your bookings.');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.isSessionExpired.set(false);

    this.sub?.unsubscribe();
    this.sub = this.bookingService.getCustomerBookings(customerId).subscribe({
      next: (data: BookingSummary[]) => {
        this.isLoading.set(false);
        this.bookings.set(data || []);
      },
      error: (err: unknown) => {
        this.isLoading.set(false);
        if (err instanceof HttpErrorResponse) {
          if (err.status === 401) {
            this.isSessionExpired.set(true);
            this.errorMessage.set('Your session has expired. Please sign in again to view your bookings.');
            return;
          }
          if (err.status === 403) {
            this.errorMessage.set('You do not have permission to view these bookings.');
            return;
          }
          if (err.status === 0 || err.status >= 500) {
            this.errorMessage.set('Unable to load your bookings right now. Please check your connection and try again.');
            return;
          }
        }
        this.errorMessage.set('An error occurred while loading your bookings. Please try again.');
      }
    });
  }
}
