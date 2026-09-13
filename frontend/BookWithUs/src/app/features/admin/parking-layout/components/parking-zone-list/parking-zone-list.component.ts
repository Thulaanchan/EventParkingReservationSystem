import { Component, Input } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';

/**
 * Local presentation projection for parking zone summary data.
 * Completely decoupled from incomplete M3 domain models.
 */
export interface AdminParkingZoneSummaryItem {
  id: number;
  name: string;
  vehicleType: string;
  fee: number;
  isOnlineBookable: boolean;
  displayOrder: number;
  slotCount: number;
}

/**
 * Presentational component displaying the list of configured parking zones,
 * their vehicle types, slot counts, zone-level fees, and online booking statuses.
 * Matches the right-panel zone summary in as-07.png.
 */
@Component({
  selector: 'app-parking-zone-list',
  standalone: true,
  imports: [CommonModule, DecimalPipe],
  templateUrl: './parking-zone-list.component.html',
  styleUrl: './parking-zone-list.component.css'
})
export class ParkingZoneListComponent {
  @Input() zones: readonly AdminParkingZoneSummaryItem[] = [];

  get sortedZones(): AdminParkingZoneSummaryItem[] {
    return [...this.zones].sort((a, b) => a.displayOrder - b.displayOrder);
  }

  get totalOnlineSlots(): number {
    return this.zones
      .filter((z) => z.isOnlineBookable)
      .reduce((sum, z) => sum + (z.slotCount ?? 0), 0);
  }

  get totalAllSlots(): number {
    return this.zones.reduce((sum, z) => sum + (z.slotCount ?? 0), 0);
  }

  /**
   * Formats real backend VehicleType into user-friendly display text.
   */
  getVehicleTypeDisplay(type: string | null | undefined): string {
    switch (type) {
      case 'ThreeWheeler':
        return 'Three-Wheeler';
      case 'Car':
        return 'Car';
      case 'Van':
        return 'Van';
      case 'Motorbike':
        return 'Motorbike';
      default:
        return type ?? 'Standard Vehicle';
    }
  }

  getVehicleIconClass(type: string | null | undefined): string {
    switch (type) {
      case 'ThreeWheeler':
        return 'icon-three-wheeler';
      case 'Car':
        return 'icon-car';
      case 'Van':
        return 'icon-van';
      case 'Motorbike':
        return 'icon-motorbike';
      default:
        return 'icon-default';
    }
  }
}
