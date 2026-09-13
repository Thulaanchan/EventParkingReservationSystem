import { BookingStatus } from '../bookings/booking-status.model';
import { PaymentMethod } from './payment-method.model';
import { PaymentStatus } from './payment-status.model';

/**
 * Result returned upon processing payment via POST /api/bookings/{bookingId}/payment.
 * Matches backend PaymentResultDto.
 */
export interface PaymentResult {
  paymentId: number;
  bookingId: number;
  bookingNumber: string;
  amountPaid: number;
  currency: string;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  bookingStatus: BookingStatus;
  paidAtUtc: string;
  message: string;
}

export type PaymentResultDto = PaymentResult;
