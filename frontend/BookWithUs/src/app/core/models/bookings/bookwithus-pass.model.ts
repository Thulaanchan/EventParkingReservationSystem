import { BookingStatus } from './booking-status.model';

export interface BookWithUsPassSeat {
  seatId: number;
  seatCode: string;
  rowLabel: string;
  seatNumber: number;
  sectionName: string;
  attendeeName: string;
}

export interface BookWithUsPass {
  bookingId: number;
  bookingNumber: string;
  bookingStatus: BookingStatus;
  eventName: string;
  eventDate: string;
  startTime: string;
  venueName: string;
  seats: BookWithUsPassSeat[];
  parkingSlotCode?: string | null;
  qrCodeValue?: string;
  issuedAt: string;
}
