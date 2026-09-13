import { PaymentMethod } from './payment-method.model';

export interface ProcessPaymentRequest {
  paymentMethod: PaymentMethod;
  cardholderName?: string | null;
  testCardNumber?: string | null;
  expiry?: string | null;
  testCvv?: string | null;
}
