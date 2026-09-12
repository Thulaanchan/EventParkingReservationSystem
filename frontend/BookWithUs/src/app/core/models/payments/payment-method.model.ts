/**
 * Supported payment method types matching backend PaymentMethod enum.
 */
export enum PaymentMethod {
  Card = 1,
  MobileWallet = 2,
  NetBanking = 3,
  LankaQr = 4
}

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  [PaymentMethod.Card]: 'Credit / Debit Card',
  [PaymentMethod.MobileWallet]: 'Mobile Wallet',
  [PaymentMethod.NetBanking]: 'Internet Banking',
  [PaymentMethod.LankaQr]: 'LankaQR'
};
