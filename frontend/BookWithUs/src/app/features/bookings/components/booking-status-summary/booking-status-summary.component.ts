import { CommonModule, DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { BookingDetails } from '../../../../core/models/bookings/booking-details.model';

@Component({
  selector: 'app-booking-status-summary',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './booking-status-summary.component.html',
  styleUrl: './booking-status-summary.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BookingStatusSummaryComponent {
  @Input({ required: true }) booking!: BookingDetails;

  formatCurrency(amount: number): string {
    const val = typeof amount === 'number' && !isNaN(amount) ? amount : 0;
    return `LKR ${val.toLocaleString('en-US')}`;
  }

  getTicketTotal(): number {
    if (!this.booking?.seats) return 0;
    return this.booking.seats.reduce((sum, s) => sum + (s.priceSnapshot || 0), 0);
  }

  getParkingFee(): number {
    return this.booking?.parking?.feeSnapshot || 0;
  }

  getStatusClass(): string {
    switch (this.booking?.bookingStatus) {
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
