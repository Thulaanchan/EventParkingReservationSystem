import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, map, of } from 'rxjs';
import {
  CustomerDashboardSummary,
  DashboardNotificationItem,
  DashboardParkingSummary,
  DashboardRecentPayment,
  DashboardRecommendedEvent,
  DashboardUpcomingBooking
} from '../../models/dashboards/customer-dashboard.model';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/customer/dashboard';

  /**
   * Retrieves authenticated customer dashboard summary counts.
   * Backend endpoint: GET /api/customer/dashboard/summary
   */
  getSummary(): Observable<CustomerDashboardSummary> {
    return this.http.get<CustomerDashboardSummary>(`${this.baseUrl}/summary`);
  }

  /**
   * Retrieves the customer's upcoming active booking details if available.
   * Backend endpoint: GET /api/bookings/customer/{customerId}
   */
  getUpcomingBooking(
    customerId: number
  ): Observable<DashboardUpcomingBooking | null> {
    return this.http
      .get<any[]>(`/api/bookings/customer/${customerId}`)
      .pipe(
        map((bookings) => {
          if (!Array.isArray(bookings) || bookings.length === 0) {
            return null;
          }

          // Find first confirmed/pending booking
          const upcoming = bookings.find(
            (b) =>
              b.bookingStatus !== 'Cancelled' &&
              b.bookingStatus !== 'Expired'
          ) || bookings[0];

          if (!upcoming) {
            return null;
          }

          return {
            bookingId: upcoming.bookingId,
            bookingNumber: upcoming.bookingNumber,
            eventName: upcoming.eventName || 'Event Booking',
            venueName: upcoming.venueName || 'Venue TBD',
            eventDate: upcoming.eventDate ? String(upcoming.eventDate) : '',
            startTime: upcoming.startTime ? String(upcoming.startTime) : null,
            seats: upcoming.seatCount ? `${upcoming.seatCount} Seats` : 'Reserved',
            bookingStatus: upcoming.bookingStatus || 'Confirmed',
            posterUrl: upcoming.posterUrl || null
          } as DashboardUpcomingBooking;
        }),
        catchError(() => of(null))
      );
  }

  /**
   * Retrieves recommended events for customer discovery.
   * Backend endpoint: GET /api/events?pageSize=3
   */
  getRecommendedEvents(): Observable<DashboardRecommendedEvent[]> {
    return this.http
      .get<any>('/api/events?pageSize=3')
      .pipe(
        map((res) => {
          const items = Array.isArray(res) ? res : res?.items;
          if (!Array.isArray(items)) {
            return [];
          }

          return items.slice(0, 3).map((e: any) => ({
            id: e.id,
            name: e.name || 'Featured Event',
            category: e.categoryName || 'GENERAL',
            venueName: e.venueName || 'Main Venue',
            eventDate: e.eventDate ? String(e.eventDate) : '',
            startTime: e.startTime ? String(e.startTime) : null,
            priceFrom: Number(e.ticketPrice) || 0,
            posterUrl: e.posterUrl || null
          })) as DashboardRecommendedEvent[];
        }),
        catchError(() => of([]))
      );
  }

  /**
   * Retrieves recent customer payment summary.
   * Backend endpoint: GET /api/payments/customer/{customerId}
   */
  getRecentPayment(
    customerId: number
  ): Observable<DashboardRecentPayment | null> {
    return this.http
      .get<any[]>(`/api/payments/customer/${customerId}`)
      .pipe(
        map((payments) => {
          if (!Array.isArray(payments) || payments.length === 0) {
            return null;
          }

          const latest = payments[0];
          return {
            paymentId: latest.paymentId,
            ticketTotal: Number(latest.amount) || 0,
            parkingFee: 0,
            amountPaid: Number(latest.amount) || 0,
            currency: latest.currency || 'LKR',
            paymentMethod: latest.paymentMethod || 'Card Payment',
            status: latest.status || 'Completed',
            paidAt: latest.paidAtUtc ? String(latest.paidAtUtc) : null
          } as DashboardRecentPayment;
        }),
        catchError(() => of(null))
      );
  }

  /**
   * Retrieves customer unread notifications.
   * Backend endpoint: GET /api/notifications/customer/{customerId}
   */
  getUnreadNotifications(
    customerId: number
  ): Observable<DashboardNotificationItem[]> {
    return this.http
      .get<any[]>(`/api/notifications/customer/${customerId}`)
      .pipe(
        map((notifications) => {
          if (!Array.isArray(notifications)) {
            return [];
          }

          return notifications
            .filter((n) => !n.isRead)
            .slice(0, 3)
            .map((n) => ({
              notificationId: n.notificationId,
              title: n.title || 'Notification',
              message: n.message || '',
              timestamp: n.createdAtUtc ? String(n.createdAtUtc) : '',
              isRead: false,
              type: 'booking'
            })) as DashboardNotificationItem[];
        }),
        catchError(() => of([]))
      );
  }
}
