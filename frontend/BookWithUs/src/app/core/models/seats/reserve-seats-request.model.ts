import { AttendeeType } from './selected-seat.model';

export interface SeatSelectionRequest {
  seatId: number;
  attendeeType: AttendeeType;
  attendeeName: string;
}

export interface ReserveSeatsRequest {
  seats: SeatSelectionRequest[];
}
