import {
  Component,
  DestroyRef,
  OnInit,
  inject
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { DashboardStatGridComponent } from '../../components/dashboard-stat-grid/dashboard-stat-grid.component';
import { UpcomingEventsTableComponent } from '../../components/upcoming-events-table/upcoming-events-table.component';
import { RecentBookingsPanelComponent } from '../../components/recent-bookings-panel/recent-bookings-panel.component';
import { AdminQuickActionsComponent } from '../../components/admin-quick-actions/admin-quick-actions.component';

import { DashboardService } from '../../../../../core/services/dashboards/dashboard.service';
import {
  AdminDashboardSummary,
  UpcomingEvent,
  RecentBooking
} from '../../../../../core/models/dashboards/admin-dashboard.model';

/**
 * Main container page for the Admin Dashboard.
 * Orchestrates real data loading via DashboardService and coordinates navigation.
 */
@Component({
  selector: 'app-admin-dashboard-page',
  standalone: true,
  imports: [
    CommonModule,
    DashboardStatGridComponent,
    UpcomingEventsTableComponent,
    RecentBookingsPanelComponent,
    AdminQuickActionsComponent
  ],
  templateUrl: './admin-dashboard-page.component.html',
  styleUrl: './admin-dashboard-page.component.css'
})
export class AdminDashboardPageComponent implements OnInit {
  private readonly dashboardService = inject(DashboardService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  // Dashboard Page State
  loading = true;
  errorMessage: string | null = null;

  // Real Backend Data
  summary: AdminDashboardSummary | null = null;
  upcomingEvents: UpcomingEvent[] = [];
  recentBookings: RecentBooking[] = [];

  ngOnInit(): void {
    this.loadDashboardData();
  }

  /**
   * Loads combined dashboard data via the existing typed forkJoin in DashboardService.
   */
  loadDashboardData(): void {
    this.loading = true;
    this.errorMessage = null;

    this.dashboardService
      .getDashboardData()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => {
          this.loading = false;
          this.summary = data.summary;
          this.upcomingEvents = data.upcomingEvents || [];
          this.recentBookings = data.recentBookings || [];
        },
        error: (err: unknown) => {
          this.loading = false;
          this.handleLoadError(err);
        }
      });
  }

  // --- Header & Quick Action Navigation ---

  onCreateEvent(): void {
    this.router.navigate(['/admin/events/new']);
  }

  onManageEvents(): void {
    this.router.navigate(['/admin/events']);
  }

  onManageVenues(): void {
    this.router.navigate(['/admin/venues']);
  }

  onManageCategories(): void {
    this.router.navigate(['/admin/categories']);
  }

  // --- Upcoming Event Actions ---

  onViewUpcomingEvent(_event: UpcomingEvent): void {
    // Event management detail drawer is hosted within /admin/events
    this.router.navigate(['/admin/events']);
  }

  onViewAllUpcomingEvents(): void {
    this.router.navigate(['/admin/events']);
  }

  // --- Recent Booking Actions (Member 1 Boundary) ---

  onViewBooking(_booking: RecentBooking): void {
    // TODO: Member 1 owns Admin Booking Management and detail routing (/admin/bookings/:id).
    // Handler safely prevents broken navigation until M1 routes are established.
  }

  onViewAllBookings(): void {
    // TODO: Member 1 owns Admin Booking Management (/admin/bookings).
    // Handler safely prevents broken navigation until M1 routes are established.
  }

  // --- Error Handling ---

  private handleLoadError(err: unknown): void {
    if (err instanceof HttpErrorResponse) {
      if (err.status === 401 || err.status === 403) {
        this.errorMessage = 'You are not authorized to view the admin dashboard.';
      } else if (err.status >= 500 || err.status === 0) {
        this.errorMessage = 'Dashboard information could not be loaded. Please try again.';
      } else {
        this.errorMessage = 'Dashboard information could not be loaded.';
      }
    } else {
      this.errorMessage = 'Dashboard information could not be loaded. Please try again.';
    }
  }
}
