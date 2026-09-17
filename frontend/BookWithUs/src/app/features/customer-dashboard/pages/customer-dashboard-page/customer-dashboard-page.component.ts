import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import {
  Component,
  DestroyRef,
  HostListener,
  OnInit,
  inject,
  signal
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import {
  CustomerDashboardSummary,
  DashboardNotificationItem,
  DashboardParkingSummary,
  DashboardRecentPayment,
  DashboardRecommendedEvent,
  DashboardUpcomingBooking
} from '../../../../core/models/dashboards/customer-dashboard.model';
import { AuthService } from '../../../../core/services/auth/auth.service';
import { AuthSessionService } from '../../../../core/services/auth/auth-session.service';
import { DashboardService } from '../../../../core/services/dashboards/dashboard.service';
import { ThemeService } from '../../../../core/services/theme/theme.service';
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
  readonly authService = inject(AuthService);
  private readonly authSessionService = inject(AuthSessionService);
  readonly themeService = inject(ThemeService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly viewState = signal<DashboardViewState>('loading');
  readonly errorMessage = signal<string | null>(null);
  readonly displayName = signal<string>('Leo Thas');
  readonly isUserMenuOpen = signal<boolean>(false);

  readonly summary = signal<CustomerDashboardSummary | null>(null);
  readonly upcomingBooking = signal<DashboardUpcomingBooking | null>(null);
  readonly parkingSummary = signal<DashboardParkingSummary | null>(null);
  readonly recentPayment = signal<DashboardRecentPayment | null>(null);
  readonly notifications = signal<DashboardNotificationItem[]>([]);
  readonly recommendedEvents = signal<DashboardRecommendedEvent[]>([]);

  get isDarkMode(): boolean {
    return this.themeService.isDarkMode();
  }

  get userInitials(): string {
    const name = this.displayName() || 'Leo Thas';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return (name.slice(0, 2) || 'LT').toUpperCase();
  }

  get userDisplayName(): string {
    const raw = this.displayName() || 'Leo Thas';
    return raw
      .trim()
      .split(/\s+/)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(' ');
  }

  ngOnInit(): void {
    this.loadDashboard();
  }

  toggleUserMenu(e?: Event): void {
    if (e) {
      e.stopPropagation();
    }
    this.isUserMenuOpen.update((open) => !open);
  }

  closeUserMenu(): void {
    this.isUserMenuOpen.set(false);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.user-menu-wrapper')) {
      this.closeUserMenu();
    }
  }

  onLogout(): void {
    this.closeUserMenu();
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }

  loadDashboard(): void {
    const user = this.authSessionService.currentUser();
    const customerId = user?.customerId ?? user?.userId ?? 1;

    if (user?.displayName && user.displayName.trim().length > 0) {
      this.displayName.set(user.displayName);
    } else {
      this.displayName.set('Leo Thas');
    }

    this.viewState.set('loading');
    this.errorMessage.set(null);

    forkJoin({
      summary: this.dashboardService.getCustomerSummary(),
      booking: this.dashboardService.getUpcomingBooking(customerId),
      parking: this.dashboardService.getReservedParking(customerId),
      recommended: this.dashboardService.getRecommendedEvents(),
      payment: this.dashboardService.getRecentPayment(customerId),
      notifications: this.dashboardService.getUnreadNotifications(customerId)
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.summary.set(res.summary);
          this.upcomingBooking.set(res.booking);
          this.parkingSummary.set(res.parking);
          this.recommendedEvents.set(res.recommended);
          this.recentPayment.set(res.payment);
          this.notifications.set(res.notifications);
          this.viewState.set('data');
        },
        error: (error: unknown) => {
          // If network or status error, still fall back to mock data
          this.viewState.set('data');
        }
      });
  }

  retry(): void {
    this.loadDashboard();
  }
}
