import { BookingStatus } from './booking-status.model';

/**
 * Summary representation of a booking returned in list endpoints:
 * - GET /api/bookings/customer/{customerId}
 * - GET /api/bookings?eventId={eventId}
 *
 * Matches backend BookingSummaryDto.
 */
export interface BookingSummary {
  bookingId: number;
  bookingNumber: string;
  customerId: number;
  eventId: number;
  bookingStatus: BookingStatus;
  eventName: string;
  eventDate?: string | null;
  startTime?: string | null;
  venueName: string;
  posterUrl?: string | null;
  seatCount: number;
  hasParking: boolean;
  totalAmount: number;
  holdExpiresAtUtc: string;
  createdAt: string;
}

export type BookingSummaryDto = BookingSummary;
