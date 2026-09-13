/**
 * Approved default booking hold duration in minutes.
 * Backend and frontend default to 15 minutes.
 */
export const DEFAULT_BOOKING_HOLD_DURATION_MINUTES = 15;

/**
 * Approved default booking hold duration in seconds (15 * 60).
 */
export const DEFAULT_BOOKING_HOLD_DURATION_SECONDS =
  DEFAULT_BOOKING_HOLD_DURATION_MINUTES * 60;

/**
 * Minimum seats allowed per booking.
 */
export const MIN_SEATS_PER_BOOKING = 1;

/**
 * Maximum seats allowed per booking.
 */
export const MAX_SEATS_PER_BOOKING = 10;

/**
 * Session storage key for transient booking selection state.
 */
export const BOOKING_SELECTION_STORAGE_KEY = 'eventflow_booking_selection';

/**
 * Centralized booking constants definition.
 */
export const BOOKING_CONSTANTS = {
  DEFAULT_HOLD_DURATION_MINUTES: DEFAULT_BOOKING_HOLD_DURATION_MINUTES,
  DEFAULT_HOLD_DURATION_SECONDS: DEFAULT_BOOKING_HOLD_DURATION_SECONDS,
  MIN_SEATS_PER_BOOKING,
  MAX_SEATS_PER_BOOKING,
  STORAGE_KEY: BOOKING_SELECTION_STORAGE_KEY
} as const;
