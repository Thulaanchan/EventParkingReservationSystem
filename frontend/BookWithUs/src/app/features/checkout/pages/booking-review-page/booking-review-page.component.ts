import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { AttendeeType } from '../../../../core/models/bookings/attendee-details.model';
import { Booking } from '../../../../core/models/bookings/booking.model';
import { AuthSessionService } from '../../../../core/services/auth/auth-session.service';
import { BookingStateService } from '../../../../core/services/bookings/booking-state.service';
import { BookingService } from '../../../../core/services/bookings/booking.service';
import {
  AttendeeFormArrayComponent,
  AttendeeFormItem
} from '../../components/attendee-form-array/attendee-form-array.component';
import {
  BookingTotalSummaryComponent,
  BookingTotalSummaryData
} from '../../components/booking-total-summary/booking-total-summary.component';
import {
  CheckoutContactSummaryComponent,
  CheckoutContactSummaryData
} from '../../components/checkout-contact-summary/checkout-contact-summary.component';
import { CheckoutEventSummaryComponent } from '../../components/checkout-event-summary/checkout-event-summary.component';
import { CheckoutParkingSummaryComponent } from '../../components/checkout-parking-summary/checkout-parking-summary.component';
import { SelectedSeatsTableComponent } from '../../components/selected-seats-table/selected-seats-table.component';

@Component({
  selector: 'app-booking-review-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    CheckoutEventSummaryComponent,
    SelectedSeatsTableComponent,
    AttendeeFormArrayComponent,
    CheckoutParkingSummaryComponent,
    CheckoutContactSummaryComponent,
    BookingTotalSummaryComponent
  ],
  templateUrl: './booking-review-page.component.html',
  styleUrl: './booking-review-page.component.css'
})
export class BookingReviewPageComponent implements OnDestroy {
  private readonly router = inject(Router);
  readonly bookingStateService = inject(BookingStateService);
  private readonly bookingService = inject(BookingService);
  private readonly authSessionService = inject(AuthSessionService);

  private bookingSubscription?: Subscription;

  // Authenticated user snapshot for contact info
  readonly currentUser = this.authSessionService.currentUser;

  // Read signals directly from BookingStateService
  readonly selectedEvent = this.bookingStateService.selectedEvent;
  readonly selectedSeats = this.bookingStateService.selectedSeats;
  readonly selectedParking = this.bookingStateService.selectedParking;
  readonly displayTotal = this.bookingStateService.displayTotal;
  readonly checkoutValidationErrors = this.bookingStateService.checkoutValidationErrors;
  readonly isCheckoutReady = this.bookingStateService.isCheckoutReady;
  readonly totalSeatPrice = this.bookingStateService.totalSeatPrice;
  readonly parkingFee = this.bookingStateService.parkingFee;
  readonly seatCount = this.bookingStateService.seatCount;
  readonly holdState = this.bookingStateService.holdState;

  // Computed state for UI display logic
  readonly hasEvent = computed(() => !!this.selectedEvent());
  readonly hasSeats = computed(() => this.selectedSeats().length > 0);
  readonly hasParking = computed(() => !!this.selectedParking());
  readonly hasErrors = computed(() => this.checkoutValidationErrors().length > 0);

  // Submission signals
  readonly isSubmitting = signal<boolean>(false);
  readonly submissionError = signal<string | null>(null);
  readonly createdBooking = signal<Booking | null>(null);
  readonly continueNotice = signal<string | null>(null);

  // Computed contact details for CheckoutContactSummaryComponent
  readonly contactData = computed<CheckoutContactSummaryData | null>(() => {
    const user = this.currentUser();
    if (!user) {
      return null;
    }
    const nameParts = (user.displayName || '').trim().split(/\s+/);
    const firstName = nameParts[0] || 'Valued';
    const lastName = nameParts.slice(1).join(' ') || 'Customer';
    return {
      firstName,
      lastName,
      email: user.email,
      phone: null,
      isEmailVerified: true
    };
  });

  // Computed total breakdown data for BookingTotalSummaryComponent
  readonly totalSummaryData = computed<BookingTotalSummaryData>(() => ({
    seatSubtotal: this.totalSeatPrice(),
    parkingFee: this.parkingFee(),
    totalAmount: this.displayTotal(),
    seatCount: this.seatCount(),
    hasParking: this.hasParking()
  }));

  ngOnDestroy(): void {
    this.bookingSubscription?.unsubscribe();
  }

  /**
   * Synchronizes attendee updates from AttendeeFormArrayComponent into booking state.
   */
  onAttendeesChanged(attendees: AttendeeFormItem[]): void {
    this.bookingStateService.updateAllAttendees(
      attendees.map((a) => ({
        seatId: a.seatId,
        attendeeName: a.attendeeName,
        attendeeType: a.attendeeType as AttendeeType
      }))
    );
  }

  /**
   * Handles user request to change the parking selection.
   */
  onChangeParking(): void {
    const event = this.selectedEvent();
    if (event?.eventId) {
      this.router.navigate(['/parking', event.eventId]);
    }
  }

  /**
   * Handles user request to remove reserved parking from the booking.
   */
  onRemoveParking(): void {
    this.bookingStateService.clearParking();
  }

  /**
   * Navigates back to the event/seat selection flow.
   */
  onBackToSelection(): void {
    const event = this.selectedEvent();
    if (event && event.eventId) {
      this.router.navigate(['/events', event.eventId]);
    } else {
      this.router.navigate(['/events']);
    }
  }

  /**
   * Submits the complete booking request to POST /api/bookings.
   * Handles seat conflicts (409), parking conflicts (409), validation errors, and success.
   */
  onContinueBooking(): void {
    if (this.isSubmitting()) {
      return;
    }

    if (!this.isCheckoutReady()) {
      this.submissionError.set(
        'Please provide valid attendee details for all selected seats before proceeding.'
      );
      return;
    }

    const request = this.bookingStateService.toCreateBookingRequest();
    if (!request) {
      this.submissionError.set(
        'Booking details are incomplete. Please select an event and at least one seat.'
      );
      return;
    }

    this.isSubmitting.set(true);
    this.submissionError.set(null);
    this.continueNotice.set(null);

    this.bookingSubscription?.unsubscribe();
    this.bookingSubscription = this.bookingService.createBooking(request).subscribe({
      next: (booking: Booking) => {
        this.isSubmitting.set(false);
        this.createdBooking.set(booking);
        // Clear customer selection state from BookingStateService on success
        this.bookingStateService.clear();
        // Navigate to payment stage
        this.router.navigate(['/checkout/payment'], {
          queryParams: { bookingId: booking.bookingId }
        });
      },
      error: (err: unknown) => {
        this.isSubmitting.set(false);
        const conflict = this.bookingService.parseConflictError(err);
        if (conflict) {
          if (this.bookingService.isSeatConflict(conflict)) {
            const seatIds = conflict.conflictingSeatIds || [];
            for (const id of seatIds) {
              this.bookingStateService.removeSeat(id);
            }
            this.submissionError.set(
              conflict.message ||
                'One or more selected seats are no longer available and were removed from your selection.'
            );
            return;
          }

          if (this.bookingService.isParkingConflict(conflict)) {
            this.bookingStateService.clearParking();
            this.submissionError.set(
              conflict.message ||
                'The selected parking slot is no longer available and has been removed from your booking.'
            );
            return;
          }

          this.submissionError.set(
            conflict.message || 'A booking conflict occurred. Please review your selection.'
          );
          return;
        }

        if (err instanceof HttpErrorResponse) {
          const apiMessage =
            err.error?.message ||
            (typeof err.error === 'string' ? err.error : null) ||
            err.statusText;
          this.submissionError.set(
            apiMessage || 'Failed to complete booking. Please check your details and try again.'
          );
          return;
        }

        this.submissionError.set(
          'An unexpected error occurred while creating your booking. Please try again.'
        );
      }
    });
  }

  /**
   * Helper to format monetary amounts as LKR currency.
   */
  formatCurrency(amount?: number | null): string {
    const val = typeof amount === 'number' && !isNaN(amount) ? amount : 0;
    return `LKR ${val.toLocaleString('en-US')}`;
  }
}
