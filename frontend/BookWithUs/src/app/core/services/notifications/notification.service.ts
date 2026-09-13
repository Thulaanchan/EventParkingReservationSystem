import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { buildApiUrl } from '../../config/api.config';
import { API_ENDPOINTS } from '../../constants/api-endpoints.constants';
import { Notification } from '../../models/notifications/notification.model';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private readonly http = inject(HttpClient);

  getCustomerNotifications(customerId: number): Observable<Notification[]> {
    return this.http.get<Notification[]>(
      buildApiUrl(API_ENDPOINTS.notifications.customerNotifications(customerId))
    );
  }

  getUnreadCount(customerId: number): Observable<number> {
    return this.http.get<number>(
      buildApiUrl(API_ENDPOINTS.notifications.unreadCount(customerId))
    );
  }

  markAsRead(notificationId: number): Observable<void> {
    return this.http.put<void>(
      buildApiUrl(API_ENDPOINTS.notifications.markRead(notificationId)),
      {}
    );
  }
}
