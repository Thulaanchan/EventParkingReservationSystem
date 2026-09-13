import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NotificationService } from '../../../../core/services/notifications/notification.service';
import { AuthSessionService } from '../../../../core/services/auth/auth-session.service';
import { ToastService } from '../../../../core/services/toast/toast.service';
import { Notification } from '../../../../core/models/notifications/notification.model';

@Component({
  selector: 'app-notifications-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notifications-page.component.html',
  styleUrl: './notifications-page.component.css'
})
export class NotificationsPageComponent implements OnInit {
  private readonly notificationService = inject(NotificationService);
  private readonly authSessionService = inject(AuthSessionService);
  private readonly toastService = inject(ToastService);

  notifications: Notification[] = [];
  filteredNotifications: Notification[] = [];
  filter: 'all' | 'unread' | 'read' = 'all';
  loading = false;
  errorMessage = '';

  ngOnInit(): void {
    this.loadNotifications();
  }

  loadNotifications(): void {
    const customerId = this.authSessionService.currentCustomerId;
    if (!customerId) {
      this.errorMessage = 'Customer session not found. Please log in.';
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    this.notificationService.getCustomerNotifications(customerId).subscribe({
      next: (data) => {
        this.notifications = data ?? [];
        this.applyFilter();
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = 'Failed to load notifications. Please try again.';
      }
    });
  }

  setFilter(filter: 'all' | 'unread' | 'read'): void {
    this.filter = filter;
    this.applyFilter();
  }

  applyFilter(): void {
    if (this.filter === 'unread') {
      this.filteredNotifications = this.notifications.filter((n) => !n.isRead);
    } else if (this.filter === 'read') {
      this.filteredNotifications = this.notifications.filter((n) => n.isRead);
    } else {
      this.filteredNotifications = [...this.notifications];
    }
  }

  get unreadCount(): number {
    return this.notifications.filter((n) => !n.isRead).length;
  }

  markAsRead(notification: Notification): void {
    if (notification.isRead) {
      return;
    }

    this.notificationService.markAsRead(notification.notificationId).subscribe({
      next: () => {
        notification.isRead = true;
        this.applyFilter();
        this.toastService.showSuccess('Notification marked as read');
      },
      error: () => {
        this.toastService.showError('Failed to mark notification as read');
      }
    });
  }

  markAllAsRead(): void {
    const unread = this.notifications.filter((n) => !n.isRead);
    if (unread.length === 0) {
      return;
    }

    unread.forEach((n) => this.markAsRead(n));
  }

  getRelativeTime(createdAtUtc: string): string {
    if (!createdAtUtc) {
      return '';
    }

    const date = new Date(
      createdAtUtc.endsWith('Z') ? createdAtUtc : `${createdAtUtc}Z`
    );
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();

    if (isNaN(diffMs) || diffMs < 0) {
      return 'just now';
    }

    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMinutes < 1) {
      return 'just now';
    }
    if (diffMinutes < 60) {
      return diffMinutes === 1 ? '1 minute ago' : `${diffMinutes} minutes ago`;
    }
    if (diffHours < 24) {
      return diffHours === 1 ? '1 hour ago' : `${diffHours} hours ago`;
    }
    if (diffDays === 1) {
      return 'Yesterday';
    }
    if (diffDays < 7) {
      return `${diffDays} days ago`;
    }
    return date.toLocaleDateString();
  }
}
