export interface CustomerDashboardSummary {
  upcomingBookingsCount: number;
  reservedParkingCount: number;
  recentPaymentsCount: number;
  unreadNotificationsCount: number;
}

export interface DashboardUpcomingBooking {
  bookingId: number;
  bookingNumber: string;
  eventName: string;
  venueName: string;
  eventDate: string;
  startTime?: string | null;
  seats: string;
  bookingStatus: string;
  posterUrl?: string | null;
}

export interface DashboardParkingSummary {
  parkingReservationId?: number;
  slotCode: string;
  zoneName: string;
  vehicleNumber?: string | null;
  eventName?: string | null;
  parkingFee?: number | null;
  status?: string | null;
}

export interface DashboardRecentPayment {
  paymentId: number;
  ticketTotal: number;
  parkingFee: number;
  amountPaid: number;
  currency: string;
  paymentMethod: string;
  status: string;
  paidAt?: string | null;
}

export interface DashboardNotificationItem {
  notificationId: number;
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  type?: 'booking' | 'payment' | 'reminder' | 'general';
}

export interface DashboardRecommendedEvent {
  id: number;
  name: string;
  category: string;
  venueName: string;
  eventDate: string;
  startTime?: string | null;
  priceFrom: number;
  posterUrl?: string | null;
}
