import { Component, Input } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';

export type SeatStatType = 'total' | 'booked' | 'held' | 'available';

export interface SeatStatCard {
  id: SeatStatType;
  label: string;
  value: number;
  helperText?: string | null;
  icon: SeatStatType;
  tone: 'purple' | 'red' | 'amber' | 'green';
}

/**
 * Presentational stat cards component for the Admin Seat Map Management view.
 * Renders exactly 4 KPI cards matching ad s 06 m.png.
 * Completely dependency-free from incomplete M3 domain models/services.
 */
@Component({
  selector: 'app-admin-seat-stats',
  standalone: true,
  imports: [CommonModule, DecimalPipe],
  templateUrl: './admin-seat-stats.component.html',
  styleUrl: './admin-seat-stats.component.css'
})
export class AdminSeatStatsComponent {
  @Input() totalSeats = 0;
  @Input() bookedSeats = 0;
  @Input() heldSeats = 0;
  @Input() availableSeats = 0;
  @Input() eventCapacity: number | null = null;

  get statCards(): SeatStatCard[] {
    const total = Math.max(0, this.totalSeats ?? 0);
    const booked = Math.max(0, this.bookedSeats ?? 0);
    const held = Math.max(0, this.heldSeats ?? 0);
    const available = Math.max(0, this.availableSeats ?? 0);

    const capacityHelper =
      this.eventCapacity !== null &&
      this.eventCapacity !== undefined &&
      this.eventCapacity >= 0
        ? `Event Capacity: ${this.eventCapacity}`
        : null;

    return [
      {
        id: 'total',
        label: 'Total Seats',
        value: total,
        helperText: capacityHelper,
        icon: 'total',
        tone: 'purple'
      },
      {
        id: 'booked',
        label: 'Booked',
        value: booked,
        icon: 'booked',
        tone: 'red'
      },
      {
        id: 'held',
        label: 'Held',
        value: held,
        icon: 'held',
        tone: 'amber'
      },
      {
        id: 'available',
        label: 'Available',
        value: available,
        icon: 'available',
        tone: 'green'
      }
    ];
  }
}
