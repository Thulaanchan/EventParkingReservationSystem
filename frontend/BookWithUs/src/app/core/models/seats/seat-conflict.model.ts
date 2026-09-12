/**
 * Unified Seat 409 conflict payload contract.
 * Accommodates responses from both:
 * 1. Direct Seat Hold endpoint (POST /api/bookings/{id}/seats) -> { status, code, message, conflictingResourceIds }
 * 2. Booking Create endpoint (POST /api/bookings) -> { message, conflictingSeatIds }
 */
export interface SeatConflict {
  message: string;
  status?: number;
  code?: string;
  conflictingResourceIds?: number[];
  conflictingSeatIds?: number[];
}

export type SeatConflictResponse = SeatConflict;
