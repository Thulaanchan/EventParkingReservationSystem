import { PaymentMethod } from './payment-method.model';

/**
 * Request payload sent to POST /api/bookings/{bookingId}/payment.
 * Matches backend ProcessPaymentRequestDto.
 */
export interface ProcessPaymentRequest {
  paymentMethod: PaymentMethod;
  cardholderName?: string | null;
  testCardNumber?: string | null;
  expiry?: string | null;
  testCvv?: string | null;
}

export type ProcessPaymentRequestDto = ProcessPaymentRequest;
