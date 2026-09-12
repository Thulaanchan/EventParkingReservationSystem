import { SeatSelectionRequest } from './booking-seat.model';

/**
 * Payload sent to POST /api/bookings.
 *
 * Backend Contract:
 * {
 *   eventId: number,
 *   seats: [
 *     {
 *       seatId: number,
 *       attendeeType: 1 | 2,
 *       attendeeName: string
 *     }
 *   ],
 *   parkingSlotId?: number
 * }
 *
 * Notice: customerId is deliberately NOT included.
 * Authenticated customer identity is resolved from the JWT token on the backend.
 */
export interface CreateBookingRequest {
  eventId: number;
  seats: SeatSelectionRequest[];
  parkingSlotId?: number | null;
}

export type CreateBookingRequestDto = CreateBookingRequest;
