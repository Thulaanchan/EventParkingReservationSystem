import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  HostListener,
  Input,
  OnDestroy,
  Output,
  computed,
  inject,
  signal
} from '@angular/core';
import { Subscription } from 'rxjs';
import { CancelBookingResponse } from '../../../../core/models/bookings/booking.model';
import { BookingStatus } from '../../../../core/models/bookings/booking-status.model';
import { BookingService } from '../../../../core/services/bookings/booking.service';

export type CancelActionState = 'idle' | 'confirming' | 'submitting' | 'error' | 'success';

@Component({
  selector: 'app-cancel-booking-action',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cancel-booking-action.component.html',
  styleUrl: './cancel-booking-action.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CancelBookingActionComponent implements OnDestroy {
  private readonly bookingService = inject(BookingService);
  private sub?: Subscription;

  @Input({ required: true }) bookingId!: number;
  @Input({ required: true }) bookingStatus!: BookingStatus;
  @Input() bookingNumber?: string;

  @Output() readonly cancellationCompleted = new EventEmitter<CancelBookingResponse>();
  @Output() readonly bookingRefreshRequested = new EventEmitter<void>();

  // Reactive state signals
  readonly state = signal<CancelActionState>('idle');
  readonly isSubmitting = signal<boolean>(false);
  readonly errorMessage = signal<string | null>(null);
  readonly successMessage = signal<string | null>(null);

  // Terminal status check: Cancelled or Expired cannot be cancelled
  readonly canCancel = computed<boolean>(() => {
    return this.bookingStatus !== 'Cancelled' && this.bookingStatus !== 'Expired';
  });

  @HostListener('keydown.escape')
  onEscapePressed(): void {
    if (this.state() === 'confirming' && !this.isSubmitting()) {
      this.onDismissConfirmation();
    }
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  onOpenConfirmation(): void {
    if (!this.canCancel() || this.isSubmitting()) return;
    this.errorMessage.set(null);
    this.successMessage.set(null);
    this.state.set('confirming');
  }

  onDismissConfirmation(): void {
    if (this.isSubmitting()) return;
    this.state.set('idle');
    this.errorMessage.set(null);
  }

  onConfirmCancellation(): void {
    // Prevent repeated API calls or duplicate submissions
    if (this.isSubmitting() || !this.canCancel()) return;

    this.isSubmitting.set(true);
    this.state.set('submitting');
    this.errorMessage.set(null);

    this.sub?.unsubscribe();
    this.sub = this.bookingService.cancelBooking(this.bookingId).subscribe({
      next: (response: CancelBookingResponse) => {
        this.isSubmitting.set(false);
        this.state.set('success');
        this.successMessage.set(response.message || 'Booking successfully cancelled.');

        // Notify parent to fetch authoritative updated state from backend
        this.cancellationCompleted.emit(response);
        this.bookingRefreshRequested.emit();
      },
      error: (err: unknown) => {
        this.isSubmitting.set(false);
        this.state.set('error');

        if (err instanceof HttpErrorResponse) {
          // 409: Booking can no longer be cancelled
          if (err.status === 409) {
            this.errorMessage.set('This booking can no longer be cancelled.');
            // Refetch booking details so UI reflects authoritative state
            this.bookingRefreshRequested.emit();
            return;
          }

          if (err.status === 401) {
            this.errorMessage.set('Your session has expired. Please sign in again.');
            return;
          }

          if (err.status === 403) {
            this.errorMessage.set('You do not have permission to cancel this booking.');
            return;
          }

          if (err.status === 404) {
            this.errorMessage.set('This booking was not found or is already unavailable.');
            this.bookingRefreshRequested.emit();
            return;
          }

          if (err.status === 0 || err.status >= 500) {
            this.errorMessage.set('Unable to cancel this booking right now. Please try again.');
            return;
          }
        }

        this.errorMessage.set('Unable to cancel this booking right now. Please try again.');
      }
    });
  }

  onCloseNotice(): void {
    this.state.set('idle');
    this.errorMessage.set(null);
    this.successMessage.set(null);
  }
}
