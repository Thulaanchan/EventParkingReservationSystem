import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import {
  Component,
  DestroyRef,
  OnInit,
  inject,
  signal
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import {
  CustomerDashboardSummary,
  DashboardNotificationItem,
  DashboardParkingSummary,
  DashboardRecentPayment,
  DashboardRecommendedEvent,
  DashboardUpcomingBooking
} from '../../../../core/models/dashboards/customer-dashboard.model';
import { AuthSessionService } from '../../../../core/services/auth/auth-session.service';
import { DashboardService } from '../../../../core/services/dashboards/dashboard.service';
import { ParkingSummaryCardComponent } from '../../components/parking-summary-card/parking-summary-card.component';
import { QuickActionsComponent } from '../../components/quick-actions/quick-actions.component';
import { RecentPaymentCardComponent } from '../../components/recent-payment-card/recent-payment-card.component';
import { RecommendedEventsComponent } from '../../components/recommended-events/recommended-events.component';
import { UnreadNotificationCardComponent } from '../../components/unread-notification-card/unread-notification-card.component';
import { UpcomingBookingCardComponent } from '../../components/upcoming-booking-card/upcoming-booking-card.component';
import { WelcomeBannerComponent } from '../../components/welcome-banner/welcome-banner.component';

export type DashboardViewState = 'loading' | 'error' | 'empty' | 'data';

@Component({
  selector: 'app-customer-dashboard-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    WelcomeBannerComponent,
    QuickActionsComponent,
    UpcomingBookingCardComponent,
    ParkingSummaryCardComponent,
    RecentPaymentCardComponent,
    UnreadNotificationCardComponent,
    RecommendedEventsComponent
  ],
  templateUrl: './customer-dashboard-page.component.html',
  styleUrl: './customer-dashboard-page.component.css'
})
export class CustomerDashboardPageComponent implements OnInit {
  private readonly dashboardService = inject(DashboardService);
  private readonly authSessionService = inject(AuthSessionService);
  private readonly destroyRef = inject(DestroyRef);

  readonly viewState = signal<DashboardViewState>('loading');
  readonly errorMessage = signal<string | null>(null);
  readonly displayName = signal<string | null>(null);

  readonly summary = signal<CustomerDashboardSummary | null>(null);
  readonly upcomingBooking = signal<DashboardUpcomingBooking | null>(null);
  readonly parkingSummary = signal<DashboardParkingSummary | null>(null);
  readonly recentPayment = signal<DashboardRecentPayment | null>(null);
  readonly notifications = signal<DashboardNotificationItem[]>([]);
  readonly recommendedEvents = signal<DashboardRecommendedEvent[]>([]);

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard(): void {
    const user = this.authSessionService.currentUser();
    const customerId = user?.customerId ?? user?.userId;

    if (!user || !customerId) {
      this.viewState.set('error');
      this.errorMessage.set(
        'Your session has expired. Please sign in to view your dashboard.'
      );
      return;
    }

    this.displayName.set(user.displayName || user.email);
    this.viewState.set('loading');
    this.errorMessage.set(null);

    forkJoin({
      summary: this.dashboardService.getSummary(),
      booking: this.dashboardService.getUpcomingBooking(customerId),
      recommended: this.dashboardService.getRecommendedEvents(),
      payment: this.dashboardService.getRecentPayment(customerId),
      notifications: this.dashboardService.getUnreadNotifications(customerId)
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.summary.set(res.summary);
          this.upcomingBooking.set(res.booking);
          this.recommendedEvents.set(res.recommended);
          this.recentPayment.set(res.payment);
          this.notifications.set(res.notifications);

          const s = res.summary;
          const hasAnyData =
            (s &&
              (s.upcomingBookingsCount > 0 ||
                s.reservedParkingCount > 0 ||
                s.recentPaymentsCount > 0 ||
                s.unreadNotificationsCount > 0)) ||
            !!res.booking ||
            res.recommended.length > 0;

          if (hasAnyData) {
            this.viewState.set('data');
          } else {
            this.viewState.set('empty');
          }
        },
        error: (error: unknown) => {
          this.viewState.set('error');
          if (error instanceof HttpErrorResponse) {
            if (error.status === 401) {
              this.errorMessage.set(
                'Your session has expired. Please sign in again.'
              );
              return;
            }
            if (error.status === 403) {
              this.errorMessage.set(
                'You do not have permission to access the customer dashboard.'
              );
              return;
            }
            if (error.status >= 500) {
              this.errorMessage.set(
                'A server error occurred while retrieving your dashboard. Please try again later.'
              );
              return;
            }
            if (error.status === 0) {
              this.errorMessage.set(
                'Unable to reach the server. Please check your network connection.'
              );
              return;
            }
          }
          this.errorMessage.set(
            'Unable to load your dashboard at this time. Please try again.'
          );
        }
      });
  }

  retry(): void {
    this.loadDashboard();
  }
}
