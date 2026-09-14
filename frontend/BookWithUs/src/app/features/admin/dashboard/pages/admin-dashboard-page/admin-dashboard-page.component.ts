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

import { DashboardService, TARGET_ADMIN_DASHBOARD_DATA } from '../../../../../core/services/dashboards/dashboard.service';
import { AuthSessionService } from '../../../../../core/services/auth/auth-session.service';
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
  private readonly authSessionService = inject(AuthSessionService);
  private readonly destroyRef = inject(DestroyRef);

  // Dashboard Page State
  loading = false;
  errorMessage: string | null = null;

  // Real Backend / Target Data
  summary: AdminDashboardSummary | null = TARGET_ADMIN_DASHBOARD_DATA.summary;
  upcomingEvents: UpcomingEvent[] = TARGET_ADMIN_DASHBOARD_DATA.upcomingEvents;
  recentBookings: RecentBooking[] = TARGET_ADMIN_DASHBOARD_DATA.recentBookings;

  get adminName(): string {
    const user = this.authSessionService.getCurrentUser();
    if (user?.displayName) {
      return user.displayName.split(' ')[0];
    }
    return 'Alex';
  }

  ngOnInit(): void {
    this.loadDashboardData();
  }

  /**
   * Loads combined dashboard data via DashboardService.
   */
  loadDashboardData(): void {
    this.errorMessage = null;

    this.dashboardService
      .getDashboardData()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => {
          this.loading = false;
          this.summary = data.summary || TARGET_ADMIN_DASHBOARD_DATA.summary;
          this.upcomingEvents = data.upcomingEvents?.length
            ? data.upcomingEvents
            : TARGET_ADMIN_DASHBOARD_DATA.upcomingEvents;
          this.recentBookings = data.recentBookings?.length
            ? data.recentBookings
            : TARGET_ADMIN_DASHBOARD_DATA.recentBookings;
        },
        error: (_err: unknown) => {
          this.loading = false;
          this.summary = TARGET_ADMIN_DASHBOARD_DATA.summary;
          this.upcomingEvents = TARGET_ADMIN_DASHBOARD_DATA.upcomingEvents;
          this.recentBookings = TARGET_ADMIN_DASHBOARD_DATA.recentBookings;
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

  onViewBookings(): void {
    this.router.navigate(['/admin/bookings']);
  }

  // --- Upcoming Event Actions ---

  onViewUpcomingEvent(_event: UpcomingEvent): void {
    this.router.navigate(['/admin/events']);
  }

  onViewAllUpcomingEvents(): void {
    this.router.navigate(['/admin/events']);
  }

  // --- Recent Booking Actions ---

  onViewBooking(_booking: RecentBooking): void {
    this.router.navigate(['/admin/bookings']);
  }

  onViewAllBookings(): void {
    this.router.navigate(['/admin/bookings']);
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
