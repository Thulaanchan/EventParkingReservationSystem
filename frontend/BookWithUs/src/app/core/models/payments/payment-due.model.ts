import { BookingStatus } from '../bookings/booking-status.model';
import { PaymentStatus } from './payment-status.model';

/**
 * Booking payment summary data returned from GET /api/bookings/{bookingId}/payment.
 * Matches backend BookingPaymentDto.
 */
export interface BookingPaymentDue {
  bookingId: number;
  bookingNumber: string;
  amountDue: number;
  currency: string;
  paymentStatus: PaymentStatus;
  bookingStatus: BookingStatus;
  holdExpiresAtUtc: string | null;
  isExpired: boolean;
  canPay: boolean;
}

export type BookingPaymentDto = BookingPaymentDue;
