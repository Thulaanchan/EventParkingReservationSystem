import { AttendeeType } from './attendee-details.model';

/**
 * Representation of a seat selected in UI before checkout.
 */
export interface SelectedSeatItem {
  seatId: number;
  seatCode: string;
  rowLabel: string;
  seatNumber: number;
  sectionName: string;
  price: number;
  attendeeType: AttendeeType;
  attendeeName: string;
}

/**
 * Transient state for in-progress booking selection across event, seat, and parking selection.
 */
export interface BookingSelectionState {
  eventId: number;
  seats: SelectedSeatItem[];
  parkingSlotId?: number | null;
  parkingFee?: number;
  totalSeatAmount: number;
  totalAmount: number;
}
