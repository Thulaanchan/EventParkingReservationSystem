import { CommonModule, DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { BookingParkingDetail } from '../../../../core/models/bookings/booking-details.model';

@Component({
  selector: 'app-booking-parking-details',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './booking-parking-details.component.html',
  styleUrl: './booking-parking-details.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BookingParkingDetailsComponent {
  @Input({ required: true }) parking?: BookingParkingDetail | null;

  formatCurrency(amount: number): string {
    const val = typeof amount === 'number' && !isNaN(amount) ? amount : 0;
    return `LKR ${val.toLocaleString('en-US')}`;
  }

  getVehicleTypeLabel(type: number | string): string {
    if (typeof type === 'string') return type;
    switch (type) {
      case 1:
        return 'Car';
      case 2:
        return 'Three-Wheeler';
      case 3:
        return 'Motorcycle';
      default:
        return 'Standard Vehicle';
    }
  }
}
