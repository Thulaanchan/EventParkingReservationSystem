/**
 * Represents the status of a temporary seat hold.
 */
export interface BookingHoldInfo {
  bookingId: number;
  holdExpiresAtUtc: string;
  remainingSeconds: number;
  isExpired: boolean;
}

/**
 * Booking hold options matching backend BookingHoldOptions configuration.
 * Default hold duration: 15 minutes.
 */
export interface BookingHoldConfig {
  defaultHoldDurationMinutes: number;
}
