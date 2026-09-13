import {
  Component,
  OnInit,
  inject,
  ElementRef,
  HostListener,
  DestroyRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { interval } from 'rxjs';

import { NotificationService } from '../../../core/services/notifications/notification.service';
import { AuthSessionService } from '../../../core/services/auth/auth-session.service';
import { Notification } from '../../../core/models/notifications/notification.model';

@Component({
  selector: 'app-notification-bell',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './notification-bell.component.html',
  styleUrl: './notification-bell.component.css'
})
export class NotificationBellComponent implements OnInit {
  private readonly notificationService = inject(NotificationService);
  private readonly authSessionService = inject(AuthSessionService);
  private readonly elementRef = inject(ElementRef);
  private readonly destroyRef = inject(DestroyRef);

  notifications: Notification[] = [];
  unreadCount = 0;
  isOpen = false;
  loading = false;
  errorMessage = '';

  ngOnInit(): void {
    const customerId = this.authSessionService.currentCustomerId;
    if (customerId) {
      this.loadUnreadCount(customerId);

      // Auto refresh unread count every 60 seconds
      interval(60000)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: () => {
            this.loadUnreadCount(customerId);
          }
        });
    }
  }

  loadUnreadCount(customerId: number): void {
    this.notificationService
      .getUnreadCount(customerId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
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

    this.notificationService
      .getCustomerNotifications(customerId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
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

    this.notificationService
      .markAsRead(notification.notificationId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          notification.isRead = true;
          this.unreadCount = Math.max(0, this.unreadCount - 1);
        },
        error: (err) => {
          console.error('Failed to mark notification as read:', err);
        }
      });
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

    if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return weeks === 1 ? '1 week ago' : `${weeks} weeks ago`;
    }

    const months = Math.floor(diffDays / 30);
    if (months < 12) {
      return months === 1 ? '1 month ago' : `${months} months ago`;
    }

    const years = Math.floor(diffDays / 365);
    return years === 1 ? '1 year ago' : `${years} years ago`;
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

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.isOpen) {
      this.closePanel();
    }
  }
}
