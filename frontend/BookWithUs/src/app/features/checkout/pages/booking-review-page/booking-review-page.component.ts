import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AttendeeType } from '../../../../core/models/bookings/attendee-details.model';
import { AuthSessionService } from '../../../../core/services/auth/auth-session.service';
import { BookingStateService } from '../../../../core/services/bookings/booking-state.service';

@Component({
  selector: 'app-booking-review-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './booking-review-page.component.html',
  styleUrl: './booking-review-page.component.css'
})
export class BookingReviewPageComponent {
  private readonly router = inject(Router);
  readonly bookingStateService = inject(BookingStateService);
  private readonly authSessionService = inject(AuthSessionService);

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

  // Placeholder feedback for upcoming step
  readonly continueNotice = signal<string | null>(null);

  /**
   * Helper to format attendee type enum into human-readable label.
   */
  getAttendeeTypeLabel(type?: AttendeeType): string {
    if (type === AttendeeType.Child) {
      return 'Child';
    }
    return 'Adult';
  }

  /**
   * Helper to format monetary values as LKR currency strings.
   */
  formatCurrency(amount?: number | null): string {
    const val = typeof amount === 'number' && !isNaN(amount) ? amount : 0;
    return `LKR ${val.toLocaleString('en-US')}`;
  }

  /**
   * Safe fallback handler for missing event poster images.
   */
  onImageError(event: Event): void {
    const target = event.target as HTMLImageElement;
    if (target) {
      target.src = 'https://placehold.co/600x400/4f46e5/ffffff?text=Event+Poster';
    }
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
   * Placeholder action for continuing booking to the payment step.
   * Does NOT make API calls as per task requirements.
   */
  onContinueBooking(): void {
    if (!this.isCheckoutReady()) {
      return;
    }
    this.continueNotice.set(
      'Booking details verified! Proceeding to the simulated payment step will be enabled in the next phase.'
    );
  }
}
