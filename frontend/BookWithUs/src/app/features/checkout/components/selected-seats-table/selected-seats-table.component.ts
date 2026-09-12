import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { AttendeeType } from '../../../../core/models/bookings/attendee-details.model';

/**
 * Item contract for seats displayed in SelectedSeatsTableComponent.
 */
export interface SelectedSeatTableItem {
  seatId: number;
  seatCode: string;
  rowLabel: string;
  seatNumber: number;
  sectionName: string;
  attendeeName: string;
  attendeeType: AttendeeType | number;
  price: number;
}

@Component({
  selector: 'app-selected-seats-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './selected-seats-table.component.html',
  styleUrl: './selected-seats-table.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SelectedSeatsTableComponent {
  /**
   * Array of selected seats provided by parent component.
   */
  @Input() seats: SelectedSeatTableItem[] = [];

  /**
   * Formats attendee type numeric enum into human-readable label.
   */
  getAttendeeTypeLabel(type: AttendeeType | number): string {
    if (type === AttendeeType.Child || type === 2) {
      return 'Child';
    }
    return 'Adult';
  }

  /**
   * Formats currency as LKR string.
   */
  formatCurrency(amount?: number | null): string {
    const val = typeof amount === 'number' && !isNaN(amount) ? amount : 0;
    return `LKR ${val.toLocaleString('en-US')}`;
  }

  /**
   * TrackBy function for table performance.
   */
  trackBySeatId(index: number, seat: SelectedSeatTableItem): number {
    return seat.seatId;
  }
}
