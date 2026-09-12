import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-customer-booking-summary',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './customer-booking-summary.component.html',
  styleUrl: './customer-booking-summary.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CustomerBookingSummaryComponent {
  readonly bookingCount = input.required<number>();
  readonly isActive = input<boolean>(true);
}
