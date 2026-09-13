import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ParkingZone } from '../../../../core/models/parking/parking-zone.model';
import { ParkingAvailability } from '../../../../core/models/parking/parking-availability.model';
import {
  VEHICLE_TYPE_LABELS,
  VehicleTypeName
} from '../../../../core/models/parking/vehicle-type.model';
import { ParkingSlotComponent } from '../parking-slot/parking-slot.component';

@Component({
  selector: 'app-parking-zone',
  standalone: true,
  imports: [CommonModule, ParkingSlotComponent],
  templateUrl: './parking-zone.component.html',
  styleUrls: ['./parking-zone.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ParkingZoneComponent {
  /**
   * Strongly typed backend metadata for this parking zone.
   */
  @Input({ required: true }) zone!: ParkingZone;

  /**
   * Collection of slots belonging to this zone.
   */
  @Input() slots: readonly ParkingAvailability[] = [];

  /**
   * Single selected parking slot ID across the customer booking session.
   */
  @Input() selectedParkingSlotId: number | null = null;

  /**
   * Re-emits slot selection upward to parent (ParkingMap / ParkingSelectionPage).
   */
  @Output() slotSelect = new EventEmitter<ParkingAvailability>();

  /**
   * Whether this zone allows online reservation based on backend configuration.
   */
  get isOnlineBookable(): boolean {
    return this.zone?.isOnlineBookable ?? true;
  }

  /**
   * Human-readable vehicle type label (e.g. "Three-Wheeler", "Car", "Van").
   */
  get vehicleLabel(): string {
    if (!this.zone) {
      return '';
    }
    return (
      (VEHICLE_TYPE_LABELS as Record<string, string>)[this.zone.vehicleType] ||
      this.zone.vehicleType
    );
  }

  /**
   * Formatted fee badge (e.g. "LKR 500").
   */
  get formattedFee(): string {
    if (!this.zone) {
      return '';
    }
    const feeValue = this.zone.fee != null ? this.zone.fee.toLocaleString() : '0';
    return `LKR ${feeValue}`;
  }

  /**
   * Number of available and online-bookable slots currently in this zone.
   */
  get availableCount(): number {
    return this.slots.filter(s => s.status === 'Available' && s.isOnlineBookable).length;
  }

  /**
   * Total slot count for this zone.
   */
  get totalCount(): number {
    return this.slots.length || this.zone?.slotCount || 0;
  }

  /**
   * Visual icon associated with the zone's vehicle type.
   */
  get vehicleIcon(): string {
    if (!this.zone) {
      return '🅿️';
    }
    switch (this.zone.vehicleType) {
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

  /**
   * Re-emits child ParkingSlotComponent selection event upward.
   */
  onSlotSelect(slot: ParkingAvailability): void {
    this.slotSelect.emit(slot);
  }
}
