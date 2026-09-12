import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input, computed } from '@angular/core';
import { BookingStatus } from '../../../../core/models/bookings/booking-status.model';

@Component({
  selector: 'app-eventflow-pass',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './eventflow-pass.component.html',
  styleUrl: './eventflow-pass.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EventflowPassComponent {
  @Input({ required: true }) bookingNumber!: string;
  @Input({ required: true }) bookingStatus!: BookingStatus;
  @Input() bookingId?: number | null;

  /**
   * Deterministically derived QR payload from the authoritative booking identifier.
   * Format: EVENTFLOW:{bookingNumber}:{bookingId}
   * No fake/random pass tokens or invented backend fields.
   */
  readonly qrPayload = computed<string>(() => {
    const ref = this.bookingNumber || '';
    const id = this.bookingId ? `:${this.bookingId}` : '';
    return `EVENTFLOW:${ref}${id}`;
  });

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
