import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface ParkingStatCard {
  id: string;
  label: string;
  count: number;
  badgeClass: string;
}

/**
 * Presentational component displaying real admin parking KPI stat cards.
 * Renders 4 cards corresponding to real backend statuses: Total Slots, Available, Held, Occupied.
 * Completely dependency-free from incomplete M3 domain models.
 */
@Component({
  selector: 'app-admin-parking-stats',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-parking-stats.component.html',
  styleUrl: './admin-parking-stats.component.css'
})
export class AdminParkingStatsComponent {
  @Input() totalSlots = 0;
  @Input() availableSlots = 0;
  @Input() heldSlots = 0;
  @Input() occupiedSlots = 0;

  get statCards(): ParkingStatCard[] {
    return [
      {
        id: 'total',
        label: 'Total Slots',
        count: Math.max(0, this.totalSlots ?? 0),
        badgeClass: 'card-total'
      },
      {
        id: 'available',
        label: 'Available',
        count: Math.max(0, this.availableSlots ?? 0),
        badgeClass: 'card-available'
      },
      {
        id: 'held',
        label: 'Held',
        count: Math.max(0, this.heldSlots ?? 0),
        badgeClass: 'card-held'
      },
      {
        id: 'occupied',
        label: 'Occupied',
        count: Math.max(0, this.occupiedSlots ?? 0),
        badgeClass: 'card-occupied'
      }
    ];
  }
}
