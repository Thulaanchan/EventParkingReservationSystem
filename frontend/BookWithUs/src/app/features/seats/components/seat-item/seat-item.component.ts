import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { SeatAvailability } from '../../../../core/models/seats/seat-availability.model';
import { SeatLabelPipe } from '../../../../shared/pipes/seat-label.pipe';
import { SeatStatusDirective } from '../../../../shared/directives/seat-status.directive';

@Component({
  selector: 'app-seat-item',
  standalone: true,
  imports: [CommonModule, SeatLabelPipe, SeatStatusDirective],
  templateUrl: './seat-item.component.html',
  styleUrls: ['./seat-item.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SeatItemComponent {
  /**
   * The backend seat availability data contract.
   */
  @Input({ required: true }) seat!: SeatAvailability;

  /**
   * Whether this seat is currently selected by the customer.
   * Client-only state managed by the parent SeatMapComponent / Booking state.
   */
  @Input() selected = false;

  /**
   * Optional selection badge index (1, 2, 3...) matching the finalized
   * customer screen reference (screen-09.png).
   */
  @Input() selectedIndex: number | null = null;

  /**
   * Typed event emitted upward to SeatMapComponent when a selectable seat is clicked.
   */
  @Output() seatSelect = new EventEmitter<SeatAvailability>();

  /**
   * Non-publicly bookable seats (e.g. VIP Pre-Reserved) as indicated in screen-09.png.
   */
  get isVip(): boolean {
    return !!this.seat && !this.seat.isPubliclyBookable;
  }

  /**
   * A seat is selectable only if the backend reports it as Available AND publicly bookable.
   * Held, Booked, and non-public seats are strictly not selectable.
   */
  get isSelectable(): boolean {
    return (
      !!this.seat &&
      this.seat.status === 'Available' &&
      !!this.seat.isPubliclyBookable
    );
  }

  /**
   * Full descriptive accessibility label conveying seat code, category, status, and price.
   */
  get accessibleLabel(): string {
    if (!this.seat) {
      return 'Seat';
    }

    const label = this.seat.seatCode || `${this.seat.rowLabel}-${this.seat.number}`;
    const category = this.seat.categoryName || 'Standard';

    if (this.isVip) {
      return `Seat ${label}, ${category}, VIP Pre-Reserved (Not available for public booking)`;
    }

    if (this.selected) {
      return `Seat ${label}, ${category}, Selected, LKR ${this.seat.adultPrice.toLocaleString()}`;
    }

    if (this.seat.status === 'Held') {
      return `Seat ${label}, ${category}, Held temporarily`;
    }

    if (this.seat.status === 'Booked') {
      return `Seat ${label}, ${category}, Already booked`;
    }

    return `Seat ${label}, ${category}, Available, LKR ${this.seat.adultPrice.toLocaleString()}`;
  }

  /**
   * Desktop hover tooltip text.
   */
  get tooltipText(): string {
    if (!this.seat) {
      return '';
    }

    const label = this.seat.seatCode || `${this.seat.rowLabel}-${this.seat.number}`;
    const category = this.seat.categoryName ? `${this.seat.categoryName} - ` : '';

    if (this.isVip) {
      return `${label} (${category}VIP Pre-Reserved)`;
    }

    if (this.selected) {
      return `${label} (${category}Selected - LKR ${this.seat.adultPrice.toLocaleString()})`;
    }

    if (this.seat.status === 'Held') {
      return `${label} (${category}Held)`;
    }

    if (this.seat.status === 'Booked') {
      return `${label} (${category}Booked)`;
    }

    return `${label} (${category}Available - LKR ${this.seat.adultPrice.toLocaleString()})`;
  }

  /**
   * Handles button click. Emits seat interaction only if the seat is selectable.
   */
  onSeatClick(event?: Event): void {
    if (event) {
      event.stopPropagation();
    }

    if (!this.isSelectable || !this.seat) {
      return;
    }

    this.seatSelect.emit(this.seat);
  }
}
