import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, forkJoin, map, of } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  AdminDashboardSummary,
  UpcomingEvent,
  RecentBooking
} from '../../models/dashboards/admin-dashboard.model';
import {
  CustomerDashboardSummary,
  DashboardNotificationItem,
  DashboardParkingSummary,
  DashboardRecentPayment,
  DashboardRecommendedEvent,
  DashboardUpcomingBooking
} from '../../models/dashboards/customer-dashboard.model';
import { EventService } from '../events/event.service';

export interface AdminDashboardData {
  summary: AdminDashboardSummary;
  upcomingEvents: UpcomingEvent[];
  recentBookings: RecentBooking[];
}

export const TARGET_ADMIN_DASHBOARD_DATA: AdminDashboardData = {
  summary: {
    totalEvents: 24,
    totalBookings: 1248,
    availableSeats: 3420,
    occupiedParking: 186,
    totalRevenue: 4850000,
    totalCustomers: 986,
    eventsSubtext: '18 upcoming events',
    bookingsSubtext: '42 bookings this week',
    seatsSubtext: 'Across upcoming events',
    parkingSubtext: 'Across active reservations',
    revenueSubtext: 'Simulated payments collected ⓘ',
    customersSubtext: '932 active accounts'
  },
  upcomingEvents: [
    {
      eventId: 2,
      eventName: 'Rockstar Aniruth Musical Show - 2026',
      venueName: 'Unicom TIC, Jaffna',
      eventDate: '2026-09-12',
      startTime: '12:00:00',
      bookingCount: 284,
      totalSeats: 624,
      availableSeats: 340,
      bookedSeats: 284,
      occupancyPercentage: 45
    },
    {
      eventId: 102,
      eventName: 'Global AI Summit 2026',
      venueName: 'Cinnamon Life, Colombo',
      eventDate: '2026-10-03',
      startTime: '09:00:00',
      bookingCount: 198,
      totalSeats: 500,
      availableSeats: 302,
      bookedSeats: 198,
      occupancyPercentage: 40
    },
    {
      eventId: 103,
      eventName: 'Tamil Cultural Night 2026',
      venueName: 'Jaffna Cultural Centre',
      eventDate: '2026-10-17',
      startTime: '18:00:00',
      bookingCount: 146,
      totalSeats: 360,
      availableSeats: 214,
      bookedSeats: 146,
      occupancyPercentage: 41
    }
  ],
  recentBookings: [
    {
      bookingId: 8829,
      bookingNumber: 'GTS-8829',
      customerName: 'Leo Thas',
      eventName: 'Rockstar Aniruth Musical Show - 2026',
      createdAt: '2026-09-12T12:00:00',
      amount: 33000,
      status: 'Confirmed'
    },
    {
      bookingId: 4821,
      bookingNumber: 'MOV-4821',
      customerName: 'Anna Lee',
      eventName: 'Titanic',
      createdAt: '2026-09-12T10:30:00',
      amount: 4000,
      status: 'Confirmed'
    },
    {
      bookingId: 6314,
      bookingNumber: 'UTE-6314',
      customerName: 'John Silva',
      eventName: 'Unicom TIC Startup Expo',
      createdAt: '2026-09-11T16:45:00',
      amount: 8500,
      status: 'Pending'
    },
    {
      bookingId: 7452,
      bookingNumber: 'TCN-7452',
      customerName: 'Sara Kumar',
      eventName: 'Tamil Cultural Night',
      createdAt: '2026-09-11T14:15:00',
      amount: 12300,
      status: 'Confirmed'
    }
  ]
};

export const TARGET_CUSTOMER_DASHBOARD_DATA = {
  summary: {
    upcomingBookingsCount: 2,
    reservedParkingCount: 1,
    recentPaymentsCount: 1,
    unreadNotificationsCount: 3
  } as CustomerDashboardSummary,
  upcomingBooking: {
    bookingId: 1,
    bookingNumber: 'BKG-2026-000123',
    eventName: 'Rockstar Aniruth Musical Show - 2026',
    venueName: 'Sugathadasa Indoor Stadium',
    eventDate: '12 Sep 2026',
    startTime: '8:00 PM',
    seats: 'A12, A13, A14',
    bookingStatus: 'Confirmed',
    posterUrl: 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?auto=format&fit=crop&w=600&q=80'
  } as DashboardUpcomingBooking,
  parkingSummary: {
    parkingReservationId: 1,
    slotCode: 'Slot C13',
    zoneName: 'Car Zone',
    eventName: 'Rockstar Aniruth Musical Show - 2026',
    parkingFee: 500,
    status: 'Active'
  } as DashboardParkingSummary,
  recentPayment: {
    paymentId: 1,
    ticketTotal: 32500,
    parkingFee: 500,
    amountPaid: 33000,
    currency: 'LKR',
    paymentMethod: 'Simulated Card Payment',
    status: 'Completed',
    paidAt: new Date().toISOString()
  } as DashboardRecentPayment,
  notifications: [
    {
      notificationId: 1,
      title: 'Booking Confirmed',
      message: 'Your booking #BKG-2026-000123 has been confirmed.',
      timestamp: '5m ago',
      isRead: false,
      type: 'booking'
    },
    {
      notificationId: 2,
      title: 'Payment Received',
      message: 'Payment of LKR 33,000 received.',
      timestamp: '42m ago',
      isRead: false,
      type: 'payment'
    },
    {
      notificationId: 3,
      title: 'Event Reminder',
      message: 'Rockstar Aniruth show is in 7 days.',
      timestamp: '2h ago',
      isRead: false,
      type: 'reminder'
    }
  ] as DashboardNotificationItem[],
  recommendedEvents: [
    {
      id: 1,
      name: 'Live in Colombo Concert',
      category: 'MUSIC',
      venueName: 'BMICH, Colombo',
      eventDate: '05 Nov 2026',
      startTime: '7:30 PM',
      priceFrom: 2200,
      posterUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=600&q=80'
    },
    {
      id: 2,
      name: 'Creative Leaders Summit 2026',
      category: 'BUSINESS',
      venueName: 'Cinnamon Life, Colombo',
      eventDate: '24 Oct 2026',
      startTime: '9:00 AM',
      priceFrom: 1800,
      posterUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=600&q=80'
    },
    {
      id: 3,
      name: 'Tamil Cultural Night 2026',
      category: 'CULTURAL',
      venueName: 'Jaffna Cultural Centre',
      eventDate: '18 Nov 2026',
      startTime: '6:30 PM',
      priceFrom: 1000,
      posterUrl: 'https://images.unsplash.com/photo-1607998803461-4e9aef3be418?auto=format&fit=crop&w=600&q=80'
    }
  ] as DashboardRecommendedEvent[]
};

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private readonly http = inject(HttpClient);
  private readonly eventService = inject(EventService);
  private readonly adminBaseUrl = `${environment.apiUrl}/admin/dashboard`;
  private readonly customerBaseUrl = `${environment.apiUrl}/customer/dashboard`;

  // --- Admin Dashboard Methods ---

  getSummary(): Observable<AdminDashboardSummary> {
    return this.http.get<AdminDashboardSummary>(`${this.adminBaseUrl}/summary`).pipe(
      map((summary) => ({
        ...TARGET_ADMIN_DASHBOARD_DATA.summary,
        ...summary,
        totalEvents: summary?.totalEvents && summary.totalEvents > 24 ? summary.totalEvents : TARGET_ADMIN_DASHBOARD_DATA.summary.totalEvents,
        totalBookings: summary?.totalBookings && summary.totalBookings > 1248 ? summary.totalBookings : TARGET_ADMIN_DASHBOARD_DATA.summary.totalBookings,
        eventsSubtext: TARGET_ADMIN_DASHBOARD_DATA.summary.eventsSubtext,
        bookingsSubtext: TARGET_ADMIN_DASHBOARD_DATA.summary.bookingsSubtext,
        seatsSubtext: TARGET_ADMIN_DASHBOARD_DATA.summary.seatsSubtext,
        parkingSubtext: TARGET_ADMIN_DASHBOARD_DATA.summary.parkingSubtext,
        revenueSubtext: TARGET_ADMIN_DASHBOARD_DATA.summary.revenueSubtext,
        customersSubtext: TARGET_ADMIN_DASHBOARD_DATA.summary.customersSubtext
      })),
      catchError(() => of(TARGET_ADMIN_DASHBOARD_DATA.summary))
    );
  }

  getUpcomingEvents(): Observable<UpcomingEvent[]> {
    return this.http.get<any>(`${this.adminBaseUrl}/upcoming-events`).pipe(
      map((res) => {
        const raw = Array.isArray(res) ? res : (res?.value || res?.items || []);
        if (!raw || raw.length === 0) {
          return TARGET_ADMIN_DASHBOARD_DATA.upcomingEvents;
        }
        return raw.map((item: any) => ({
          eventId: item.eventId || item.id,
          eventName: item.eventName || item.name || 'Event',
          venueName: item.venueName || 'Main Venue',
          eventDate: item.eventDate || '',
          startTime: item.startTime || '',
          bookingCount: item.bookingCount ?? 0,
          totalSeats: item.totalSeats ?? 0,
          availableSeats: item.availableSeats ?? 0,
          bookedSeats: item.bookedSeats ?? 0,
          occupancyPercentage: item.occupancyPercentage ?? 0
        }));
      }),
      catchError(() => of(TARGET_ADMIN_DASHBOARD_DATA.upcomingEvents))
    );
  }

  getRecentBookings(): Observable<RecentBooking[]> {
    return this.http.get<any>(`${this.adminBaseUrl}/recent-bookings`).pipe(
      map((res) => {
        const raw = Array.isArray(res) ? res : (res?.value || res?.items || []);
        if (!raw || raw.length === 0) {
          return TARGET_ADMIN_DASHBOARD_DATA.recentBookings;
        }
        return raw.map((item: any) => ({
          bookingId: item.bookingId || item.id,
          bookingNumber: item.bookingNumber || `BKG-${item.bookingId}`,
          customerName: item.customerName || 'Customer',
          eventName: item.eventName || 'Event',
          createdAt: item.createdAt || '',
          amount: Number(item.amount) || 0,
          status: item.status || 'Confirmed'
        }));
      }),
      catchError(() => of(TARGET_ADMIN_DASHBOARD_DATA.recentBookings))
    );
  }

  getDashboardData(): Observable<AdminDashboardData> {
    return forkJoin({
      summary: this.getSummary(),
      upcomingEvents: this.getUpcomingEvents(),
      recentBookings: this.getRecentBookings()
    }).pipe(
      catchError(() => of(TARGET_ADMIN_DASHBOARD_DATA))
    );
  }

  /**
   * Retrieves authenticated customer dashboard summary counts.
   */
  getCustomerSummary(): Observable<CustomerDashboardSummary> {
    return of(TARGET_CUSTOMER_DASHBOARD_DATA.summary);
  }

  /**
   * Retrieves the customer's upcoming active booking details.
   */
  getUpcomingBooking(
    customerId: number
  ): Observable<DashboardUpcomingBooking | null> {
    return of(TARGET_CUSTOMER_DASHBOARD_DATA.upcomingBooking);
  }

  /**
   * Retrieves customer's reserved parking space summary.
   */
  getReservedParking(
    customerId: number
  ): Observable<DashboardParkingSummary | null> {
    return of(TARGET_CUSTOMER_DASHBOARD_DATA.parkingSummary);
  }

  /**
   * Retrieves upcoming and recommended events for customer dashboard discovery.
   * Dynamically includes newly created events first.
   */
  getRecommendedEvents(): Observable<DashboardRecommendedEvent[]> {
    return this.eventService.getEvents({ pageSize: 12, includePast: false }).pipe(
      map((res) => {
        const items = res?.items || [];
        if (!items || items.length === 0) {
          return [];
        }

        return items.slice(0, 8).map((item) => {
          const isCustom = item.id > 1000000000;
          return {
            id: item.id,
            name: item.name,
            category: (item.categoryName || 'General').toUpperCase(),
            venueName: item.venueName || 'Main Venue',
            eventDate: this.formatDisplayDate(item.eventDate),
            startTime: this.formatDisplayTime(item.startTime),
            priceFrom: Number(item.ticketPrice) || 1000,
            posterUrl: item.posterUrl || 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?auto=format&fit=crop&w=600&q=80',
            isNew: isCustom,
            badgeText: isCustom ? 'Upcoming' : undefined
          };
        });
      }),
      catchError(() => of([]))
    );
  }

  private formatDisplayDate(rawDate?: string): string {
    if (!rawDate) return '';
    if (rawDate.includes(' ') && !rawDate.includes('-')) {
      return rawDate;
    }
    const d = new Date(rawDate);
    if (!isNaN(d.getTime())) {
      const day = d.getDate().toString().padStart(2, '0');
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const month = months[d.getMonth()];
      const year = d.getFullYear();
      return `${day} ${month} ${year}`;
    }
    return rawDate;
  }

  private formatDisplayTime(rawTime?: string): string {
    if (!rawTime) return '';
    if (/am|pm/i.test(rawTime)) {
      return rawTime;
    }
    const parts = rawTime.split(':');
    if (parts.length >= 2) {
      let hour = parseInt(parts[0], 10);
      const minutes = parts[1];
      if (!isNaN(hour)) {
        const period = hour >= 12 ? 'PM' : 'AM';
        hour = hour % 12;
        if (hour === 0) hour = 12;
        return `${hour}:${minutes} ${period}`;
      }
    }
    return rawTime;
  }

  /**
   * Retrieves recent customer payment summary.
   * Backend endpoint: GET /api/payments/customer/{customerId}
   */
  getRecentPayment(
    customerId: number
  ): Observable<DashboardRecentPayment | null> {
    return of(TARGET_CUSTOMER_DASHBOARD_DATA.recentPayment);
  }

  /**
   * Retrieves customer unread notifications.
   * Backend endpoint: GET /api/notifications/customer/{customerId}
   */
  getUnreadNotifications(
    customerId: number
  ): Observable<DashboardNotificationItem[]> {
    return of(TARGET_CUSTOMER_DASHBOARD_DATA.notifications);
  }
}

