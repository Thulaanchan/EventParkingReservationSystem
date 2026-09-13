import { BookingSeatDetail } from './booking-seat.model';
import { BookingStatus } from './booking-status.model';

/**
 * Event detail snapshot inside a booking details DTO.
 * Matches backend BookingEventDetailDto.
 */
export interface BookingEventDetail {
  eventId: number;
  eventName: string;
  description?: string | null;
  eventDate: string;
  startTime: string;
  endTime: string;
  venueName: string;
  categoryName: string;
  posterUrl?: string | null;
}

/**
 * Parking detail snapshot inside a booking details DTO.
 * Matches backend BookingParkingDetailDto.
 */
export interface BookingParkingDetail {
  parkingReservationId: number;
  parkingSlotId: number;
  slotCode: string;
  zoneName: string;
  vehicleType: number | string;
  feeSnapshot: number;
  reservedAtUtc: string;
}

/**
 * Full booking details matching backend BookingDto.
 */
export interface BookingDetails {
  bookingId: number;
  bookingNumber: string;
  customerId: number;
  eventId: number;
  bookingStatus: BookingStatus;
  holdExpiresAtUtc: string;
  createdAt: string;
  updatedAt?: string | null;
  event?: BookingEventDetail | null;
  seats: BookingSeatDetail[];
  parking?: BookingParkingDetail | null;
  totalAmount: number;
}
