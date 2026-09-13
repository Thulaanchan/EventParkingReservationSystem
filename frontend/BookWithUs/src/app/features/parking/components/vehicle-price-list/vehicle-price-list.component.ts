import {
  ChangeDetectionStrategy,
  Component,
  Input
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ParkingZone } from '../../../../core/models/parking/parking-zone.model';
import {
  VEHICLE_TYPE_LABELS,
  VehicleTypeName
} from '../../../../core/models/parking/vehicle-type.model';

@Component({
  selector: 'app-vehicle-price-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './vehicle-price-list.component.html',
  styleUrls: ['./vehicle-price-list.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VehiclePriceListComponent {
  /**
   * Real parking zones collection from backend availability data.
   */
  @Input() zones: readonly ParkingZone[] = [];

  /**
   * Sorts zones respecting backend displayOrder (falling back to id).
   */
  get orderedZones(): readonly ParkingZone[] {
    return [...this.zones].sort(
      (a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0) || a.id - b.id
    );
  }

  getVehicleLabel(type: VehicleTypeName | string): string {
    return (
      (VEHICLE_TYPE_LABELS as Record<string, string>)[type] || type
    );
  }

  formatFee(fee: number | null | undefined): string {
    const feeVal = fee != null ? fee.toLocaleString() : '0';
    return `LKR ${feeVal}`;
  }

  getVehicleIcon(type: VehicleTypeName | string): string {
    switch (type) {
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
}
