/**
 * Attendee type matching backend AttendeeType enum (Adult = 1, Child = 2).
 * Note: If M1 provides a shared canonical AttendeeType model later, this can align with it.
 */
export enum AttendeeType {
  Adult = 1,
  Child = 2
}

export type AttendeeTypeName = 'Adult' | 'Child';

/**
 * Customer frontend seat selection state.
 * Represents a seat currently selected by the customer in the UI,
 * passed to BookingStateService and eventually mapped to SeatSelectionRequest.
 */
export interface SelectedSeat {
  seatId: number;
  seatCode: string;
  rowLabel: string;
  number: number;
  sectionId: number;
  sectionCode: string;
  sectionName: string;
  categoryCode: string;
  categoryName: string;
  attendeeType: AttendeeType;
  attendeeName?: string;
  price: number;
}
