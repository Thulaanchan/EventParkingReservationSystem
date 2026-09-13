import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DashboardParkingSummary } from '../../../../core/models/dashboards/customer-dashboard.model';

@Component({
  selector: 'app-parking-summary-card',
  standalone: true,
  imports: [CommonModule, RouterLink, CurrencyPipe],
  templateUrl: './parking-summary-card.component.html',
  styleUrl: './parking-summary-card.component.css'
})
export class ParkingSummaryCardComponent {
  @Input() count = 0;
  @Input() parking: DashboardParkingSummary | null = null;
  @Input() isLoading = false;
}
