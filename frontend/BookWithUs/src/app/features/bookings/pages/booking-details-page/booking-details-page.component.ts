import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { BookingDetails } from '../../../../core/models/bookings/booking-details.model';
import { CancelBookingResponse } from '../../../../core/models/bookings/booking.model';
import { BookingStatus } from '../../../../core/models/bookings/booking-status.model';
import { AuthSessionService } from '../../../../core/services/auth/auth-session.service';
import { BookingService } from '../../../../core/services/bookings/booking.service';
import { BookingDetailsHeaderComponent } from '../../components/booking-details-header/booking-details-header.component';
import { BookingEventDetailsComponent } from '../../components/booking-event-details/booking-event-details.component';
import { BookingParkingDetailsComponent } from '../../components/booking-parking-details/booking-parking-details.component';
import { BookingSeatDetailsComponent } from '../../components/booking-seat-details/booking-seat-details.component';
import { BookingStatusSummaryComponent } from '../../components/booking-status-summary/booking-status-summary.component';
import { CancelBookingActionComponent } from '../../components/cancel-booking-action/cancel-booking-action.component';
import { EventflowPassComponent } from '../../components/eventflow-pass/eventflow-pass.component';

export type BookingDetailsState = 'loading' | 'error' | 'not-found' | 'access-denied' | 'data';

@Component({
  selector: 'app-booking-details-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    BookingDetailsHeaderComponent,
    BookingEventDetailsComponent,
    BookingSeatDetailsComponent,
    BookingParkingDetailsComponent,
    BookingStatusSummaryComponent,
    EventflowPassComponent,
    CancelBookingActionComponent
  ],
  templateUrl: './booking-details-page.component.html',
  styleUrl: './booking-details-page.component.css'
})
export class BookingDetailsPageComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly bookingService = inject(BookingService);
  private readonly authSessionService = inject(AuthSessionService);

  private sub?: Subscription;

  // Resolved booking ID from route parameter
  readonly bookingId = signal<number | null>(null);

  // Reactive state signals
  readonly isLoading = signal<boolean>(true);
  readonly errorMessage = signal<string | null>(null);
  readonly isSessionExpired = signal<boolean>(false);
  readonly isNotFound = signal<boolean>(false);
  readonly isAccessDenied = signal<boolean>(false);
  readonly booking = signal<BookingDetails | null>(null);

  // Authenticated user snapshot for customer info card
  readonly currentUser = this.authSessionService.currentUser;

  // Mutually exclusive view state: loading | error | not-found | access-denied | data
  readonly viewState = computed<BookingDetailsState>(() => {
    if (this.isLoading()) {
      return 'loading';
    }
    if (this.isNotFound()) {
      return 'not-found';
    }
    if (this.isAccessDenied()) {
      return 'access-denied';
    }
    if (this.errorMessage()) {
      return 'error';
    }
    if (this.booking()) {
      return 'data';
    }
    return 'error';
  });

  // Derived parking summary string for the event card
  readonly parkingSummaryText = computed<string | null>(() => {
    const p = this.booking()?.parking;
    if (!p) return null;
    return `Parking ${p.slotCode} (${p.zoneName || 'Standard'})`;
  });

  ngOnInit(): void {
    this.extractRouteParamAndLoad();
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  onRetry(): void {
    const id = this.bookingId();
    if (id) {
      this.fetchBooking(id);
    } else {
      this.extractRouteParamAndLoad();
    }
  }

  onGoToLogin(): void {
    const id = this.bookingId();
    const redirectUrl = id ? `/bookings/${id}` : '/bookings';
    this.router.navigate(['/auth/login'], { queryParams: { redirectUrl } });
  }

  onCancellationCompleted(_response: CancelBookingResponse): void {
    // Authoritatively re-fetch the booking from the backend
    const id = this.bookingId();
    if (id) {
      this.fetchBooking(id);
    }
  }

  onBookingRefreshRequested(): void {
    // Authoritatively re-fetch the booking from the backend
    const id = this.bookingId();
    if (id) {
      this.fetchBooking(id);
    }
  }

  private extractRouteParamAndLoad(): void {
    const rawId = this.route.snapshot.paramMap.get('id');
    const id = rawId ? parseInt(rawId, 10) : null;

    if (!id || isNaN(id) || id <= 0) {
      this.isLoading.set(false);
      this.isNotFound.set(true);
      this.errorMessage.set('Invalid booking identifier specified.');
      return;
    }

    this.bookingId.set(id);
    this.fetchBooking(id);
  }

  private fetchBooking(id: number): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.isNotFound.set(false);
    this.isAccessDenied.set(false);
    this.isSessionExpired.set(false);

    this.sub?.unsubscribe();
    this.sub = this.bookingService.getBookingById(id).subscribe({
      next: (data) => {
        this.isLoading.set(false);
        this.booking.set(data as BookingDetails);
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
            this.errorMessage.set('You do not have permission to view this booking reservation.');
            return;
          }

          if (err.status === 404) {
            this.isNotFound.set(true);
            this.errorMessage.set('Booking reservation not found.');
            return;
          }

          if (err.status === 0 || err.status >= 500) {
            this.errorMessage.set('Unable to load booking details right now. Please check your connection and try again.');
            return;
          }
        }

        this.errorMessage.set('An error occurred while loading the booking details. Please try again.');
      }
    });
  }
}
