import { CommonModule, DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BookingStatus } from '../../../../core/models/bookings/booking-status.model';
import { BookingSummary } from '../../../../core/models/bookings/booking-summary.model';

@Component({
  selector: 'app-booking-card',
  standalone: true,
  imports: [CommonModule, RouterLink, DatePipe],
  templateUrl: './booking-card.component.html',
  styleUrl: './booking-card.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BookingCardComponent {
  @Input({ required: true }) booking!: BookingSummary;
  @Output() readonly viewDetails = new EventEmitter<number>();

  onViewDetails(): void {
    this.viewDetails.emit(this.booking.bookingId);
  }

  formatCurrency(amount: number): string {
    const val = typeof amount === 'number' && !isNaN(amount) ? amount : 0;
    return `LKR ${val.toLocaleString('en-US')}`;
  }

  getStatusClass(status: BookingStatus): string {
    switch (status) {
      case 'Confirmed':
        return 'status-confirmed';
      case 'Pending':
        return 'status-pending';
      case 'Cancelled':
        return 'status-cancelled';
      case 'Expired':
        return 'status-expired';
      default:
        return 'status-pending';
    }
  }
}
