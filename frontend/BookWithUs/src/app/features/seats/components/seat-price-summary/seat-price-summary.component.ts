import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SelectedSeat } from '../../../../core/models/seats/selected-seat.model';

@Component({
  selector: 'app-seat-price-summary',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './seat-price-summary.component.html',
  styleUrls: ['./seat-price-summary.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SeatPriceSummaryComponent {
  /**
   * The list of seats currently selected by the customer.
   */
  @Input() selectedSeats: readonly SelectedSeat[] = [];

  /**
   * Optional authoritative subtotal passed from parent.
   * If omitted, calculated directly by summing selectedSeats prices.
   */
  @Input() subtotal: number | null = null;

  /**
   * Optional child discount disclaimer text (e.g. "Children tickets are priced with a 50% discount.").
   */
  @Input() discountNote?: string | null = null;

  /**
   * Computed display subtotal for selected seats.
   * Does NOT include parking fees, taxes, or unapproved charges.
   */
  get displaySubtotal(): number {
    if (this.subtotal != null && !isNaN(this.subtotal)) {
      return this.subtotal;
    }
    if (!this.selectedSeats || this.selectedSeats.length === 0) {
      return 0;
    }
    return this.selectedSeats.reduce((sum, seat) => sum + (Number(seat.price) || 0), 0);
  }

  /**
   * Total number of selected seats.
   */
  get seatCount(): number {
    return this.selectedSeats?.length || 0;
  }
}
