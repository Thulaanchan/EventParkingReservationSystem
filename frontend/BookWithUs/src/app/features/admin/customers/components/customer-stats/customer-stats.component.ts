import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-customer-stats',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './customer-stats.component.html',
  styleUrl: './customer-stats.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CustomerStatsComponent {
  readonly totalCount = input.required<number>();
  readonly currentPage = input<number>(1);
  readonly totalPages = input<number>(1);
  readonly pageActiveCount = input<number>(0);
  readonly pageVerifiedCount = input<number>(0);
  readonly isLoading = input<boolean>(false);
}
