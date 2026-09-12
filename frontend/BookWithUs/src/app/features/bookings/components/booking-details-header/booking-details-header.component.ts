import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BookingStatus } from '../../../../core/models/bookings/booking-status.model';

@Component({
  selector: 'app-booking-details-header',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './booking-details-header.component.html',
  styleUrl: './booking-details-header.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BookingDetailsHeaderComponent {
  @Input({ required: true }) bookingNumber!: string;
  @Input({ required: true }) bookingStatus!: BookingStatus;

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
