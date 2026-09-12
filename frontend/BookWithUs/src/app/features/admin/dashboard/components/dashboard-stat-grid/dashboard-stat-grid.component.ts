import { Component, Input } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { AdminDashboardSummary } from '../../../../../../core/models/dashboards/admin-dashboard.model';

export type StatIconType =
  | 'events'
  | 'bookings'
  | 'seats'
  | 'parking'
  | 'revenue'
  | 'customers';

export interface DashboardStatCard {
  id: string;
  label: string;
  value: number;
  isCurrency?: boolean;
  icon: StatIconType;
}

/**
 * Presentational stat grid for the Admin Dashboard.
 * Renders exactly the 6 real backend metrics from AdminDashboardSummary
 * in a responsive 3-column layout matching as-01.png.
 */
@Component({
  selector: 'app-dashboard-stat-grid',
  standalone: true,
  imports: [CommonModule, DecimalPipe],
  templateUrl: './dashboard-stat-grid.component.html',
  styleUrl: './dashboard-stat-grid.component.css'
})
export class DashboardStatGridComponent {
  @Input() summary: AdminDashboardSummary | null = null;

  get statCards(): DashboardStatCard[] {
    const s = this.summary;

    return [
      {
        id: 'totalEvents',
        label: 'TOTAL EVENTS',
        value: s?.totalEvents ?? 0,
        icon: 'events'
      },
      {
        id: 'totalBookings',
        label: 'TOTAL BOOKINGS',
        value: s?.totalBookings ?? 0,
        icon: 'bookings'
      },
      {
        id: 'availableSeats',
        label: 'AVAILABLE SEATS',
        value: s?.availableSeats ?? 0,
        icon: 'seats'
      },
      {
        id: 'occupiedParking',
        label: 'OCCUPIED PARKING',
        value: s?.occupiedParking ?? 0,
        icon: 'parking'
      },
      {
        id: 'totalRevenue',
        label: 'TOTAL REVENUE',
        value: s?.totalRevenue ?? 0,
        isCurrency: true,
        icon: 'revenue'
      },
      {
        id: 'totalCustomers',
        label: 'TOTAL CUSTOMERS',
        value: s?.totalCustomers ?? 0,
        icon: 'customers'
      }
    ];
  }
}
