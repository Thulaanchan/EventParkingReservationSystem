import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { AttendeeType, SelectedSeat } from '../../../../core/models/seats/selected-seat.model';

@Component({
  selector: 'app-selected-seats-summary',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './selected-seats-summary.component.html',
  styleUrls: ['./selected-seats-summary.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SelectedSeatsSummaryComponent {
  /**
   * The list of seats currently selected by the customer.
   */
  @Input() selectedSeats: readonly SelectedSeat[] = [];

  /**
   * Optional total seats required by customer's ticket requirements (e.g. 3).
   */
  @Input() totalRequired?: number | null = null;

  /**
   * Emits the ID of a seat to be removed / deselected.
   */
  @Output() removeSeat = new EventEmitter<number>();

  /**
   * Emits when the user clicks 'Clear All'.
   */
  @Output() clearAll = new EventEmitter<void>();

  /**
   * Converts attendee type enum/number to a customer-friendly text label.
   */
  getAttendeeLabel(attendeeType: AttendeeType | number): string {
    if (attendeeType === AttendeeType.Child || attendeeType === 2) {
      return 'Child';
    }
    return 'Adult';
  }

  /**
   * Color dot indicator class for categories matching screen-09.png.
   */
  getCategoryDotClass(categoryNameOrCode: string): string {
    const name = (categoryNameOrCode || '').toLowerCase();
    if (name.includes('plat')) {
      return 'dot-platinum';
    }
    if (name.includes('gold')) {
      return 'dot-gold';
    }
    if (name.includes('silv')) {
      return 'dot-silver';
    }
    if (name.includes('vip')) {
      return 'dot-vip';
    }
    return 'dot-default';
  }

  onRemove(seatId: number, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    this.removeSeat.emit(seatId);
  }

  onClearAll(): void {
    this.clearAll.emit();
  }
}
