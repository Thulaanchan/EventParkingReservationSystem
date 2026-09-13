import { PaymentMethod } from './payment-method.model';
import { PaymentStatus } from './payment-status.model';

export interface Payment {
  paymentId: number;
  bookingId: number;
  bookingNumber: string;
  amountPaid: number;
  currency: string;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  bookingStatus: number;
  paidAtUtc: string;
  message: string;
}
