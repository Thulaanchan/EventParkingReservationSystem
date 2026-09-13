/**
 * Attendee type enum matching backend AttendeeType:
 * Adult = 1
 * Child = 2
 *
 * Must be serialized as numeric values in create booking requests.
 */
export enum AttendeeType {
  Adult = 1,
  Child = 2
}

export type AttendeeTypeString = 'Adult' | 'Child';

export interface AttendeeDetails {
  attendeeName: string;
  attendeeType: AttendeeType;
}

export interface AttendeeSelectionItem extends AttendeeDetails {
  seatId: number;
}
