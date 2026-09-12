import { CommonModule, DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { BookingEventDetail } from '../../../../core/models/bookings/booking-details.model';
import { BookingStatus } from '../../../../core/models/bookings/booking-status.model';

@Component({
  selector: 'app-booking-event-details',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './booking-event-details.component.html',
  styleUrl: './booking-event-details.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BookingEventDetailsComponent {
  @Input({ required: true }) event?: BookingEventDetail | null;
  @Input({ required: true }) bookingNumber!: string;
  @Input({ required: true }) bookingStatus!: BookingStatus;
  @Input({ required: true }) createdAt!: string;
  @Input() holdExpiresAtUtc?: string | null;
  @Input() seatCount: number = 0;
  @Input() parkingInfo?: string | null;

  getStatusBadgeClass(): string {
    switch (this.bookingStatus) {
      case 'Confirmed':
        return 'badge-confirmed';
      case 'Pending':
        return 'badge-pending';
      case 'Cancelled':
        return 'badge-cancelled';
      case 'Expired':
        return 'badge-expired';
      default:
        return 'badge-pending';
    }
  }
}
