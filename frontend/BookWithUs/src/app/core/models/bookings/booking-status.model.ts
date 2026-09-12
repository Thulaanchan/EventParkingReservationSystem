/**
 * Strict booking status values as defined by the backend domain model.
 * Exactly: Pending | Confirmed | Cancelled | Expired.
 */
export type BookingStatus = 'Pending' | 'Confirmed' | 'Cancelled' | 'Expired';

export const BookingStatus = {
  Pending: 'Pending' as const,
  Confirmed: 'Confirmed' as const,
  Cancelled: 'Cancelled' as const,
  Expired: 'Expired' as const
} as const;

export const BOOKING_STATUSES: readonly BookingStatus[] = [
  BookingStatus.Pending,
  BookingStatus.Confirmed,
  BookingStatus.Cancelled,
  BookingStatus.Expired
];

/**
 * Normalizes backend booking status values (both string representations and enum integers)
 * to the strict BookingStatus union.
 */
export function normalizeBookingStatus(status: unknown): BookingStatus {
  if (status === 0 || status === '0' || status === 'Pending') {
    return BookingStatus.Pending;
  }
  if (status === 1 || status === '1' || status === 'Confirmed') {
    return BookingStatus.Confirmed;
  }
  if (status === 2 || status === '2' || status === 'Cancelled') {
    return BookingStatus.Cancelled;
  }
  if (status === 3 || status === '3' || status === 'Expired') {
    return BookingStatus.Expired;
  }
  return BookingStatus.Pending;
}
