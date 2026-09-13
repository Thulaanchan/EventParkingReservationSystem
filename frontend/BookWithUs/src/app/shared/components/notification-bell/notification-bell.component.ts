import {
  Component,
  OnInit,
  inject,
  ElementRef,
  HostListener
} from '@angular/core';
import { CommonModule } from '@angular/common';

import { NotificationService } from '../../../core/services/notifications/notification.service';
import { AuthSessionService } from '../../../core/services/auth/auth-session.service';
import { Notification } from '../../../core/models/notifications/notification.model';

@Component({
  selector: 'app-notification-bell',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notification-bell.component.html',
  styleUrl: './notification-bell.component.css'
})
export class NotificationBellComponent implements OnInit {
  private readonly notificationService = inject(NotificationService);
  private readonly authSessionService = inject(AuthSessionService);
  private readonly elementRef = inject(ElementRef);

  notifications: Notification[] = [];
  unreadCount = 0;
  isOpen = false;
  loading = false;
  errorMessage = '';

  ngOnInit(): void {
    const customerId = this.authSessionService.currentCustomerId;
    if (customerId) {
      this.loadUnreadCount(customerId);
    }
  }

  loadUnreadCount(customerId: number): void {
    this.notificationService.getUnreadCount(customerId).subscribe({
      next: (count) => {
        this.unreadCount = count ?? 0;
      },
      error: (err) => {
        console.error('Failed to load unread notification count:', err);
      }
    });
  }

  togglePanel(): void {
    this.isOpen = !this.isOpen;

    if (this.isOpen) {
      this.loadNotifications();
    }
  }

  closePanel(): void {
    this.isOpen = false;
  }

  loadNotifications(): void {
    const customerId = this.authSessionService.currentCustomerId;
    if (!customerId) {
      this.errorMessage = 'Unable to load notifications';
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    this.notificationService.getCustomerNotifications(customerId).subscribe({
      next: (notifications) => {
        this.notifications = notifications ?? [];
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = 'Unable to load notifications';
        console.error('Failed to load notifications:', err);
      }
    });
  }

  onNotificationClick(notification: Notification): void {
    if (!notification.isRead) {
      this.markAsRead(notification);
    }
  }

  markAsRead(notification: Notification): void {
    if (notification.isRead) {
      return;
    }

    this.notificationService.markAsRead(notification.notificationId).subscribe({
      next: () => {
        notification.isRead = true;
        this.unreadCount = Math.max(0, this.unreadCount - 1);
      },
      error: (err) => {
        console.error('Failed to mark notification as read:', err);
      }
    });
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.isOpen) {
      return;
    }

    const clickedInside = this.elementRef.nativeElement.contains(
      event.target as Node
    );
    if (!clickedInside) {
      this.closePanel();
    }
  }
}
