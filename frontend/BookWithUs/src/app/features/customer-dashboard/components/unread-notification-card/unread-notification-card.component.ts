import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DashboardNotificationItem } from '../../../../core/models/dashboards/customer-dashboard.model';

@Component({
  selector: 'app-unread-notification-card',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './unread-notification-card.component.html',
  styleUrl: './unread-notification-card.component.css'
})
export class UnreadNotificationCardComponent {
  @Input() count = 0;
  @Input() notifications: DashboardNotificationItem[] = [];
  @Input() isLoading = false;
}
