import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

/**
 * Breakdown of ticket and parking costs and grand total for checkout.
 */
export interface BookingTotalSummaryData {
  seatSubtotal: number;
  parkingFee: number;
  totalAmount: number;
  seatCount: number;
  hasParking: boolean;
}

@Component({
  selector: 'app-booking-total-summary',
  standalone: true,
  imports: [],
  templateUrl: './booking-total-summary.component.html',
  styleUrl: './booking-total-summary.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BookingTotalSummaryComponent {
  /**
   * Total summary pricing breakdown supplied by parent.
   */
  @Input() summary: BookingTotalSummaryData | null = null;

  /**
   * Whether the continue button should be disabled (e.g. form invalid or empty).
   */
  @Input() isContinueDisabled: boolean = false;

  /**
   * Whether checkout submission is currently in progress.
   */
  @Input() isSubmitting: boolean = false;

  /**
   * Optional custom label for the primary action button.
   */
  @Input() continueLabel: string = 'Continue Booking';

  /**
   * Whether to display the secondary 'Back to Selection' button.
   */
  @Input() showBackButton: boolean = true;

  /**
   * Event emitted when customer clicks continue booking.
   */
  @Output() readonly continue = new EventEmitter<void>();

  /**
   * Event emitted when customer clicks back to selection.
   */
  @Output() readonly back = new EventEmitter<void>();

  /**
   * Helper to format numbers as LKR currency.
   */
  formatCurrency(amount?: number | null): string {
    const val = typeof amount === 'number' && !isNaN(amount) ? amount : 0;
    return `LKR ${val.toLocaleString('en-US')}`;
  }
}
