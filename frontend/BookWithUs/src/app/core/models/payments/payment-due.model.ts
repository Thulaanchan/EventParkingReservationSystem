import { PaymentStatus } from './payment-status.model';

export interface PaymentDue {
  bookingId: number;
  bookingNumber: string;
  amountDue: number;
  currency: string;
  paymentStatus: PaymentStatus;
  bookingStatus: number;
  holdExpiresAtUtc: string | null;
  isExpired: boolean;
  canPay: boolean;
}
