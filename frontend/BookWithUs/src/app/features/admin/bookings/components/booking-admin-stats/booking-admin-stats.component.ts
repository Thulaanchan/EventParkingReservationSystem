import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-booking-admin-stats',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './booking-admin-stats.component.html',
  styleUrl: './booking-admin-stats.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BookingAdminStatsComponent {
  readonly totalCount = input.required<number>();
  readonly confirmedCount = input<number>(0);
  readonly pendingCount = input<number>(0);
  readonly cancelledOrExpiredCount = input<number>(0);
  readonly totalRevenue = input<number>(0);
  readonly isLoading = input<boolean>(false);
}
