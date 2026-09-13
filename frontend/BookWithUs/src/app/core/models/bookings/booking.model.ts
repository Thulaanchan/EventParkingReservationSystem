import {
  BookingDetails,
  BookingEventDetail,
  BookingParkingDetail
} from './booking-details.model';
import { BookingSeatDetail } from './booking-seat.model';
import { BookingStatus } from './booking-status.model';

/**
 * Primary Booking entity matching backend BookingDto.
 */
export interface Booking {
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

export type BookingDto = Booking;

/**
 * Backend response contract for DELETE /api/bookings/{id}.
 * Matches backend CancelBookingResponseDto.
 */
export interface CancelBookingResponse {
  bookingId: number;
  bookingNumber: string;
  bookingStatus: BookingStatus;
  message: string;
}

export type CancelBookingResponseDto = CancelBookingResponse;

/**
 * Backend 409 Conflict payload returned for seat double-booking conflicts.
 * Returned from BookingConflictException.
 */
export interface SeatConflictError {
  message: string;
  conflictingSeatIds: number[];
}

/**
 * Backend 409 Conflict payload returned for parking slot conflicts.
 * Returned from ParkingConflictException.
 */
export interface ParkingConflictError {
  message: string;
  conflictingParkingSlotId?: number | null;
}

/**
 * Generic booking conflict response type.
 */
export type BookingConflictPayload =
  | SeatConflictError
  | ParkingConflictError
  | { message: string };

/**
 * Type guard for seat conflict errors (409).
 */
export function isSeatConflictError(error: unknown): error is SeatConflictError {
  if (!error || typeof error !== 'object') {
    return false;
  }
  const candidate = error as Record<string, unknown>;
  return Array.isArray(candidate['conflictingSeatIds']);
}

/**
 * Type guard for parking conflict errors (409).
 */
export function isParkingConflictError(error: unknown): error is ParkingConflictError {
  if (!error || typeof error !== 'object') {
    return false;
  }
  const candidate = error as Record<string, unknown>;
  return (
    'conflictingParkingSlotId' in candidate &&
    candidate['conflictingParkingSlotId'] !== undefined
  );
}
