import { Component, Input } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { AdminDashboardSummary } from '../../../../../core/models/dashboards/admin-dashboard.model';

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
  subtext?: string;
  isCurrency?: boolean;
  icon: StatIconType;
}

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
        value: s?.totalEvents ?? 24,
        subtext: s?.eventsSubtext ?? '18 upcoming events',
        icon: 'events'
      },
      {
        id: 'totalBookings',
        label: 'TOTAL BOOKINGS',
        value: s?.totalBookings ?? 1248,
        subtext: s?.bookingsSubtext ?? '42 bookings this week',
        icon: 'bookings'
      },
      {
        id: 'availableSeats',
        label: 'AVAILABLE SEATS',
        value: s?.availableSeats ?? 3420,
        subtext: s?.seatsSubtext ?? 'Across upcoming events',
        icon: 'seats'
      },
      {
        id: 'occupiedParking',
        label: 'OCCUPIED PARKING',
        value: s?.occupiedParking ?? 186,
        subtext: s?.parkingSubtext ?? 'Across active reservations',
        icon: 'parking'
      },
      {
        id: 'totalRevenue',
        label: 'TOTAL REVENUE',
        value: s?.totalRevenue ?? 4850000,
        subtext: s?.revenueSubtext ?? 'Simulated payments collected ⓘ',
        isCurrency: true,
        icon: 'revenue'
      },
      {
        id: 'totalCustomers',
        label: 'TOTAL CUSTOMERS',
        value: s?.totalCustomers ?? 986,
        subtext: s?.customersSubtext ?? '932 active accounts',
        icon: 'customers'
      }
    ];
  }
}
