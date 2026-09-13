import { AttendeeType } from './attendee-details.model';

/**
 * Detailed seat item returned in backend BookingDto.Seats.
 */
export interface BookingSeatDetail {
  seatId: number;
  seatCode: string;
  rowLabel: string;
  seatNumber: number;
  sectionName: string;
  attendeeName: string;
  attendeeType: AttendeeType;
  priceSnapshot: number;
}

/**
 * Seat selection item sent in create booking requests.
 * Contains seatId, attendeeType (1 = Adult, 2 = Child), and attendeeName.
 */
export interface SeatSelectionRequest {
  seatId: number;
  attendeeType: AttendeeType;
  attendeeName: string;
}
