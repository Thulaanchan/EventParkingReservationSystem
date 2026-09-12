export interface AdminDashboardSummary {
  totalEvents: number;
  totalBookings: number;
  availableSeats: number;
  occupiedParking: number;
  totalRevenue: number;
  totalCustomers: number;
}

export type AdminDashboard = AdminDashboardSummary;

export interface UpcomingEvent {
  eventId: number;
  eventName: string;
  venueName: string;
  eventDate: string;
  startTime: string;
  bookingCount: number;
  totalSeats: number;
  availableSeats: number;
  bookedSeats: number;
  occupancyPercentage: number;
}

export interface RecentBooking {
  bookingId: number;
  bookingNumber: string;
  customerName: string;
  eventName: string;
  createdAt: string;
  amount: number;
  status: string;
}
