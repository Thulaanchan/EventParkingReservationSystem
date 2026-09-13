import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DashboardRecentPayment } from '../../../../core/models/dashboards/customer-dashboard.model';

@Component({
  selector: 'app-recent-payment-card',
  standalone: true,
  imports: [CommonModule, RouterLink, CurrencyPipe],
  templateUrl: './recent-payment-card.component.html',
  styleUrl: './recent-payment-card.component.css'
})
export class RecentPaymentCardComponent {
  @Input() count = 0;
  @Input() payment: DashboardRecentPayment | null = null;
  @Input() isLoading = false;
}
