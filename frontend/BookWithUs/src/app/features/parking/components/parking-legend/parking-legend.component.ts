import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ParkingZone } from '../../../../core/models/parking/parking-zone.model';
import { VEHICLE_TYPE_LABELS, VehicleTypeName } from '../../../../core/models/parking/vehicle-type.model';

export interface ParkingStatusLegendItem {
  id: string;
  label: string;
  description: string;
  cssClass: string;
  badgeSymbol?: string;
  badgeClass?: string;
}

@Component({
  selector: 'app-parking-legend',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './parking-legend.component.html',
  styleUrls: ['./parking-legend.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ParkingLegendComponent {
  /**
   * Optional backend-supplied parking zones to present vehicle type tags if useful.
   */
  @Input() zones: readonly ParkingZone[] = [];

  /**
   * Status swatch items matching screen-10.png top legend bar:
   * - Available ("Free to book")
   * - Selected ("Your selection")
   * - Held ("Temporarily held")
   * - Occupied ("Not available")
   */
  readonly statusItems: readonly ParkingStatusLegendItem[] = [
    {
      id: 'available',
      label: 'Available',
      description: 'Free to book',
      cssClass: 'swatch-available'
    },
    {
      id: 'selected',
      label: 'Selected',
      description: 'Your selection',
      cssClass: 'swatch-selected'
    },
    {
      id: 'held',
      label: 'Held',
      description: 'Temporarily held',
      cssClass: 'swatch-held',
      badgeSymbol: '🔒',
      badgeClass: 'badge-held'
    },
    {
      id: 'occupied',
      label: 'Occupied',
      description: 'Not available',
      cssClass: 'swatch-occupied',
      badgeSymbol: '✕',
      badgeClass: 'badge-occupied'
    },
    {
      id: 'offline',
      label: 'Offline',
      description: 'Online booking unavailable',
      cssClass: 'swatch-offline'
    }
  ];

  /**
   * Resolves vehicle type display labels dynamically.
   */
  getVehicleLabel(type: VehicleTypeName | string): string {
    return (VEHICLE_TYPE_LABELS as Record<string, string>)[type] || type;
  }
}
