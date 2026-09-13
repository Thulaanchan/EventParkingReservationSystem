import { PaymentMethod } from './payment-method.model';
import { PaymentStatus } from './payment-status.model';

export interface PaymentSummary {
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
