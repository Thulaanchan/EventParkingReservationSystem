import { PaymentMethod } from './payment-method.model';
import { PaymentStatus } from './payment-status.model';

/**
 * Customer payment history entry matching backend PaymentHistoryDto.
 */
export interface PaymentHistoryItem {
  paymentId: number;
  bookingId: number;
  bookingNumber: string;
  eventName: string;
  amount: number;
  currency: string;
  paymentMethod: PaymentMethod;
  status: PaymentStatus;
  paidAtUtc: string;
  receiptAvailable: boolean;
}

export type PaymentHistoryDto = PaymentHistoryItem;
