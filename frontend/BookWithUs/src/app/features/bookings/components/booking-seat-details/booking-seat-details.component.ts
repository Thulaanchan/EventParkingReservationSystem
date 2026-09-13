import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input, computed } from '@angular/core';
import { AttendeeType } from '../../../../core/models/bookings/attendee-details.model';
import { BookingSeatDetail } from '../../../../core/models/bookings/booking-seat.model';

@Component({
  selector: 'app-booking-seat-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './booking-seat-details.component.html',
  styleUrl: './booking-seat-details.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BookingSeatDetailsComponent {
  @Input({ required: true }) seats: BookingSeatDetail[] = [];

  readonly AttendeeType = AttendeeType;

  formatCurrency(amount: number): string {
    const val = typeof amount === 'number' && !isNaN(amount) ? amount : 0;
    return `LKR ${val.toLocaleString('en-US')}`;
  }

  getTicketTotal(): number {
    return this.seats.reduce((sum, s) => sum + (s.priceSnapshot || 0), 0);
  }

  getAttendeeLabel(seat: BookingSeatDetail): string {
    const name = seat.attendeeName ? seat.attendeeName.trim() : '';
    const isChild =
      seat.attendeeType === AttendeeType.Child ||
      (seat.attendeeType as unknown) === 'Child';
    const typeLabel = isChild ? 'Child (50% Off)' : 'Adult';

    if (name) {
      return `${name} (${typeLabel})`;
    }
    return typeLabel;
  }
}
