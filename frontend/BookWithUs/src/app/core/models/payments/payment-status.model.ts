/**
 * Payment transaction status values matching backend PaymentStatus enum.
 */
export enum PaymentStatus {
  Pending = 0,
  Completed = 1,
  Failed = 2
}

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  [PaymentStatus.Pending]: 'Pending',
  [PaymentStatus.Completed]: 'Completed',
  [PaymentStatus.Failed]: 'Failed'
};
