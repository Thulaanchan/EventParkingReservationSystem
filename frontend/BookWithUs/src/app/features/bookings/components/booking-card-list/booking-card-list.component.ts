import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { BookingSummary } from '../../../../core/models/bookings/booking-summary.model';
import { BookingCardComponent } from '../booking-card/booking-card.component';

@Component({
  selector: 'app-booking-card-list',
  standalone: true,
  imports: [BookingCardComponent],
  templateUrl: './booking-card-list.component.html',
  styleUrl: './booking-card-list.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BookingCardListComponent {
  @Input({ required: true }) bookings: BookingSummary[] = [];
  @Output() readonly viewDetails = new EventEmitter<number>();

  onViewDetails(bookingId: number): void {
    this.viewDetails.emit(bookingId);
  }
}
