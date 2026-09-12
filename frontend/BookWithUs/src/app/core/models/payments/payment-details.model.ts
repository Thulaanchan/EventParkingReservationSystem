import { PaymentMethod } from './payment-method.model';
import { PaymentStatus } from './payment-status.model';

/**
 * Detailed payment receipt matching backend PaymentReceiptDto.
 */
export interface PaymentReceipt {
  paymentId: number;
  bookingId: number;
  bookingNumber: string;
  customerName: string;
  eventName: string;
  eventDateTime: string;
  venueName: string;
  seatAmount: number;
  parkingAmount: number;
  totalAmount: number;
  currency: string;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  paidAtUtc: string;
}

export type PaymentReceiptDto = PaymentReceipt;
