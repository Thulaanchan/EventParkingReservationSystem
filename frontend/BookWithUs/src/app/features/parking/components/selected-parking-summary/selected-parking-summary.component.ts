import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { SelectedParking } from '../../../../core/models/parking/selected-parking.model';
import {
  VEHICLE_TYPE_LABELS,
  VehicleTypeName
} from '../../../../core/models/parking/vehicle-type.model';
import { SlotCodePipe } from '../../../../shared/pipes/slot-code.pipe';

@Component({
  selector: 'app-selected-parking-summary',
  standalone: true,
  imports: [CommonModule, SlotCodePipe],
  templateUrl: './selected-parking-summary.component.html',
  styleUrls: ['./selected-parking-summary.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SelectedParkingSummaryComponent {
  /**
   * At most ONE customer parking selection across the booking session.
   * Null indicates no parking is currently selected.
   */
  @Input() selectedParking: SelectedParking | null = null;

  /**
   * Emits when customer removes/deselects the chosen parking slot.
   */
  @Output() removeParking = new EventEmitter<void>();

  get isSelected(): boolean {
    return this.selectedParking !== null;
  }

  get slotCode(): string {
    return this.selectedParking?.slotCode || '';
  }

  get zoneName(): string {
    return this.selectedParking?.zoneName || '';
  }

  get vehicleLabel(): string {
    if (!this.selectedParking) {
      return '';
    }
    return (
      (VEHICLE_TYPE_LABELS as Record<string, string>)[
        this.selectedParking.vehicleType
      ] || this.selectedParking.vehicleType
    );
  }

  get formattedFee(): string {
    if (!this.selectedParking) {
      return '';
    }
    const feeVal =
      this.selectedParking.fee != null
        ? this.selectedParking.fee.toLocaleString()
        : '0';
    return `LKR ${feeVal}`;
  }

  get vehicleIcon(): string {
    if (!this.selectedParking) {
      return '🅿️';
    }
    switch (this.selectedParking.vehicleType) {
      case 'ThreeWheeler':
        return '🛺';
      case 'Car':
        return '🚗';
      case 'Van':
        return '🚐';
      case 'Motorbike':
        return '🏍️';
      default:
        return '🅿️';
    }
  }

  get removeAriaLabel(): string {
    return this.selectedParking
      ? `Remove parking slot ${this.selectedParking.slotCode}`
      : 'Remove parking selection';
  }

  onRemove(): void {
    this.removeParking.emit();
  }
}
