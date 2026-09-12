import { BookingStatus } from './booking-status.model';

export interface EventFlowPassSeat {
  seatId: number;
  seatCode: string;
  rowLabel: string;
  seatNumber: number;
  sectionName: string;
  attendeeName: string;
}

export interface EventFlowPass {
  bookingId: number;
  bookingNumber: string;
  bookingStatus: BookingStatus;
  eventName: string;
  eventDate: string;
  startTime: string;
  venueName: string;
  seats: EventFlowPassSeat[];
  parkingSlotCode?: string | null;
  qrCodeValue?: string;
  issuedAt: string;
}
