import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output
} from '@angular/core';
import { BookingSummary } from '../../../../../core/models/bookings/booking-summary.model';

@Component({
  selector: 'app-booking-admin-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './booking-admin-table.component.html',
  styleUrl: './booking-admin-table.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BookingAdminTableComponent {
  @Input({ required: true }) bookings: BookingSummary[] = [];
  @Input() isLoading = false;

  @Output() readonly bookingSelected = new EventEmitter<BookingSummary>();

  onSelectBooking(booking: BookingSummary): void {
    this.bookingSelected.emit(booking);
  }
}
