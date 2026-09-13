import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

/**
 * Contract for parking selection details passed from parent component.
 */
export interface CheckoutParkingSummaryData {
  parkingSlotId: number;
  slotCode: string;
  zoneName?: string | null;
  vehicleType?: number | string | null;
  fee?: number | null;
}

@Component({
  selector: 'app-checkout-parking-summary',
  standalone: true,
  imports: [],
  templateUrl: './checkout-parking-summary.component.html',
  styleUrl: './checkout-parking-summary.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CheckoutParkingSummaryComponent {
  /**
   * Selected parking slot information provided by parent component.
   */
  @Input() parking: CheckoutParkingSummaryData | null = null;

  /**
   * Optional event emitted if user requests changing the parking slot.
   */
  @Output() readonly changeRequested = new EventEmitter<void>();

  /**
   * Optional event emitted if user requests removing parking.
   */
  @Output() readonly removeRequested = new EventEmitter<void>();

  /**
   * Formats numeric fee as LKR currency string.
   */
  formatCurrency(amount?: number | null): string {
    const val = typeof amount === 'number' && !isNaN(amount) ? amount : 0;
    return `LKR ${val.toLocaleString('en-US')}`;
  }

  /**
   * Formats vehicle type value into a user-friendly label.
   */
  getVehicleTypeLabel(vehicleType?: number | string | null): string {
    if (vehicleType === null || vehicleType === undefined) {
      return 'Standard Vehicle';
    }
    if (typeof vehicleType === 'number') {
      switch (vehicleType) {
        case 1:
          return 'Three Wheeler';
        case 2:
          return 'Car';
        case 3:
          return 'Van';
        case 4:
          return 'Motorbike';
        default:
          return 'Standard Vehicle';
      }
    }
    return String(vehicleType);
  }
}
