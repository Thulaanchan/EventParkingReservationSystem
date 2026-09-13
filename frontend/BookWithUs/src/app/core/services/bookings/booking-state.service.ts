import { computed, Injectable, signal, Signal } from '@angular/core';
import { DEFAULT_BOOKING_HOLD_DURATION_MINUTES } from '../../constants/booking.constants';
import { AttendeeType } from '../../models/bookings/attendee-details.model';
import {
  BookingSelectionState,
  SelectedSeatItem
} from '../../models/bookings/booking-selection.model';
import { CreateBookingRequest } from '../../models/bookings/create-booking-request.model';

/**
 * Event details stored in client booking state.
 */
export interface BookingSelectedEvent {
  eventId: number;
  eventName: string;
  eventDate?: string | null;
  startTime?: string | null;
  endTime?: string | null;
  venueName?: string | null;
  categoryName?: string | null;
  posterUrl?: string | null;
  description?: string | null;
}

/**
 * Flexible input type for adding or setting seats before attendee info is gathered.
 */
export interface BookingSelectedSeatInput {
  seatId: number;
  seatCode: string;
  rowLabel?: string;
  seatNumber?: number;
  sectionName?: string;
  price?: number;
  attendeeName?: string;
  attendeeType?: AttendeeType;
}

/**
 * Type alias to use SelectedSeatItem from booking-selection models.
 */
export type BookingSelectedSeat = SelectedSeatItem;

/**
 * Optional parking slot selection stored in booking state.
 */
export interface BookingSelectedParking {
  parkingSlotId: number;
  slotCode: string;
  zoneName?: string;
  fee?: number;
  vehicleType?: number | string;
}

/**
 * Informational hold state. Server-side hold expiration remains authoritative.
 */
export interface BookingHoldState {
  holdExpiresAtUtc: string | null;
  holdDurationMinutes: number;
  isHoldActive: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class BookingStateService {
  // Private signals for mutable state
  private readonly _selectedEvent = signal<BookingSelectedEvent | null>(null);
  private readonly _selectedSeats = signal<BookingSelectedSeat[]>([]);
  private readonly _selectedParking = signal<BookingSelectedParking | null>(null);
  private readonly _holdState = signal<BookingHoldState>(this.createInitialHoldState());

  // Public readonly signals
  readonly selectedEvent: Signal<BookingSelectedEvent | null> =
    this._selectedEvent.asReadonly();
  readonly selectedSeats: Signal<BookingSelectedSeat[]> =
    this._selectedSeats.asReadonly();
  readonly selectedParking: Signal<BookingSelectedParking | null> =
    this._selectedParking.asReadonly();
  readonly holdState: Signal<BookingHoldState> =
    this._holdState.asReadonly();

  // Computed state
  readonly seatCount: Signal<number> = computed(() =>
    this._selectedSeats().length
  );

  readonly hasEventSelected: Signal<boolean> = computed(() =>
    this._selectedEvent() !== null
  );

  readonly hasSeatsSelected: Signal<boolean> = computed(() =>
    this._selectedSeats().length > 0
  );

  readonly hasParkingSelected: Signal<boolean> = computed(() =>
    this._selectedParking() !== null
  );

  /**
   * Display total for seats based on available price data.
   * Note: This is an informational display calculation, not authoritative billing.
   */
  readonly totalSeatPrice: Signal<number> = computed(() => {
    return this._selectedSeats().reduce(
      (sum, seat) => sum + (seat.price || 0),
      0
    );
  });

  /**
   * Display fee for optional parking.
   */
  readonly parkingFee: Signal<number> = computed(() => {
    return this._selectedParking()?.fee || 0;
  });

  /**
   * Calculated display total (seats + optional parking).
   * Note: Server-side calculated TotalAmount from snapshots is authoritative.
   */
  readonly displayTotal: Signal<number> = computed(() => {
    return this.totalSeatPrice() + this.parkingFee();
  });

  /**
   * Validates whether all selected seats have valid attendee details assigned.
   */
  readonly areAttendeesValid: Signal<boolean> = computed(() => {
    const seats = this._selectedSeats();
    if (seats.length === 0) {
      return false;
    }
    return seats.every(
      (seat) =>
        typeof seat.attendeeName === 'string' &&
        seat.attendeeName.trim().length > 0 &&
        (seat.attendeeType === AttendeeType.Adult ||
          seat.attendeeType === AttendeeType.Child)
    );
  });

  /**
   * Evaluates validation errors blocking checkout progression.
   */
  readonly checkoutValidationErrors: Signal<string[]> = computed(() => {
    const errors: string[] = [];
    const event = this._selectedEvent();
    const seats = this._selectedSeats();

    if (!event || !event.eventId || event.eventId <= 0) {
      errors.push('An event must be selected before proceeding to checkout.');
    }

    if (seats.length === 0) {
      errors.push('At least one seat must be selected.');
    }

    for (const seat of seats) {
      if (!seat.attendeeName || seat.attendeeName.trim().length === 0) {
        errors.push(
          `Attendee name is required for seat ${seat.seatCode || seat.seatId}.`
        );
      }
    }

    const parking = this._selectedParking();
    if (parking && (!parking.parkingSlotId || parking.parkingSlotId <= 0)) {
      errors.push('Selected parking slot has an invalid identifier.');
    }

    return errors;
  });

  /**
   * Flag indicating whether the customer's selection satisfies checkout prerequisites.
   */
  readonly isCheckoutReady: Signal<boolean> = computed(() => {
    return this.checkoutValidationErrors().length === 0;
  });

  // ==========================================
  // EVENT SELECTION
  // ==========================================

  /**
   * Sets the active event for booking. If switching to a different event,
   * resets previously selected seats and parking to avoid cross-event pollution.
   */
  setEvent(event: BookingSelectedEvent): void {
    const current = this._selectedEvent();
    if (current && current.eventId !== event.eventId) {
      this._selectedSeats.set([]);
      this._selectedParking.set(null);
    }
    this._selectedEvent.set(event);
  }

  /**
   * Clears the current event selection.
   */
  clearEvent(): void {
    this._selectedEvent.set(null);
    this._selectedSeats.set([]);
    this._selectedParking.set(null);
  }

  // ==========================================
  // SEAT SELECTION & ATTENDEES
  // ==========================================

  /**
   * Sets or replaces the selected seats, automatically preventing duplicate seat IDs.
   */
  setSeats(seats: BookingSelectedSeatInput[]): void {
    const uniqueMap = new Map<number, BookingSelectedSeat>();
    for (const input of seats) {
      if (!uniqueMap.has(input.seatId)) {
        uniqueMap.set(input.seatId, this.normalizeSeatInput(input));
      }
    }
    this._selectedSeats.set(Array.from(uniqueMap.values()));
  }

  /**
   * Adds a seat to the selection if not already present.
   * Prevents duplicate seat IDs.
   */
  addSeat(seatInput: BookingSelectedSeatInput): void {
    const current = this._selectedSeats();
    if (current.some((s) => s.seatId === seatInput.seatId)) {
      return;
    }
    const normalized = this.normalizeSeatInput(seatInput);
    this._selectedSeats.set([...current, normalized]);
  }

  /**
   * Removes a seat from selection by seat ID.
   */
  removeSeat(seatId: number): void {
    this._selectedSeats.update((seats) =>
      seats.filter((s) => s.seatId !== seatId)
    );
  }

  /**
   * Clears all selected seats.
   */
  clearSeats(): void {
    this._selectedSeats.set([]);
  }

  /**
   * Updates attendee details for a specific seat in the selection.
   */
  updateAttendee(
    seatId: number,
    attendeeName: string,
    attendeeType: AttendeeType = AttendeeType.Adult
  ): void {
    this._selectedSeats.update((seats) =>
      seats.map((seat) => {
        if (seat.seatId === seatId) {
          return {
            ...seat,
            attendeeName: attendeeName.trim(),
            attendeeType
          };
        }
        return seat;
      })
    );
  }

  /**
   * Batch updates attendee information across multiple seats.
   */
  updateAllAttendees(
    attendees: {
      seatId: number;
      attendeeName: string;
      attendeeType?: AttendeeType;
    }[]
  ): void {
    const attendeeMap = new Map(
      attendees.map((a) => [a.seatId, a])
    );

    this._selectedSeats.update((seats) =>
      seats.map((seat) => {
        const update = attendeeMap.get(seat.seatId);
        if (update) {
          return {
            ...seat,
            attendeeName: update.attendeeName.trim(),
            attendeeType: update.attendeeType ?? seat.attendeeType
          };
        }
        return seat;
      })
    );
  }

  // ==========================================
  // PARKING SELECTION
  // ==========================================

  /**
   * Sets or updates the optional parking reservation slot.
   */
  setParking(parking: BookingSelectedParking): void {
    this._selectedParking.set(parking);
  }

  /**
   * Clears the optional parking slot selection.
   */
  clearParking(): void {
    this._selectedParking.set(null);
  }

  // ==========================================
  // BOOKING HOLD (INFORMATIONAL)
  // ==========================================

  /**
   * Sets informational booking hold state.
   * Uses DEFAULT_BOOKING_HOLD_DURATION_MINUTES from constants when duration is omitted.
   * Note: Server-side hold expiration is always authoritative.
   */
  setHold(
    holdExpiresAtUtc: string | Date | null,
    durationMinutes: number = DEFAULT_BOOKING_HOLD_DURATION_MINUTES
  ): void {
    const expiresString =
      holdExpiresAtUtc instanceof Date
        ? holdExpiresAtUtc.toISOString()
        : holdExpiresAtUtc;

    const isHoldActive = expiresString
      ? new Date(expiresString).getTime() > Date.now()
      : false;

    this._holdState.set({
      holdExpiresAtUtc: expiresString,
      holdDurationMinutes: durationMinutes,
      isHoldActive
    });
  }

  /**
   * Clears the informational hold state.
   */
  clearHold(): void {
    this._holdState.set(this.createInitialHoldState());
  }

  // ==========================================
  // EXPORT & RESET
  // ==========================================

  /**
   * Builds the exact backend CreateBookingRequest payload from current state.
   * Returns null if no event or no seats are selected.
   */
  toCreateBookingRequest(): CreateBookingRequest | null {
    const event = this._selectedEvent();
    const seats = this._selectedSeats();

    if (!event || seats.length === 0) {
      return null;
    }

    return {
      eventId: event.eventId,
      seats: seats.map((seat) => ({
        seatId: seat.seatId,
        attendeeType: seat.attendeeType ?? AttendeeType.Adult,
        attendeeName: (seat.attendeeName || '').trim()
      })),
      parkingSlotId: this._selectedParking()?.parkingSlotId ?? null
    };
  }

  /**
   * Returns a snapshot of the current selection state.
   */
  getSnapshot(): BookingSelectionState {
    const event = this._selectedEvent();
    return {
      eventId: event?.eventId ?? 0,
      seats: this._selectedSeats(),
      parkingSlotId: this._selectedParking()?.parkingSlotId ?? null,
      parkingFee: this.parkingFee(),
      totalSeatAmount: this.totalSeatPrice(),
      totalAmount: this.displayTotal()
    };
  }

  /**
   * Resets all booking state to initial empty values (e.g., on checkout completion or logout).
   */
  resetBookingState(): void {
    this._selectedEvent.set(null);
    this._selectedSeats.set([]);
    this._selectedParking.set(null);
    this._holdState.set(this.createInitialHoldState());
  }

  /**
   * Convenience alias for resetBookingState.
   */
  clear(): void {
    this.resetBookingState();
  }

  // ==========================================
  // INTERNAL HELPERS
  // ==========================================

  private normalizeSeatInput(input: BookingSelectedSeatInput): BookingSelectedSeat {
    return {
      seatId: input.seatId,
      seatCode: input.seatCode,
      rowLabel: input.rowLabel ?? '',
      seatNumber: input.seatNumber ?? 0,
      sectionName: input.sectionName ?? '',
      price:
        typeof input.price === 'number' && !isNaN(input.price)
          ? input.price
          : 0,
      attendeeName: input.attendeeName ?? '',
      attendeeType: input.attendeeType ?? AttendeeType.Adult
    };
  }

  private createInitialHoldState(): BookingHoldState {
    return {
      holdExpiresAtUtc: null,
      holdDurationMinutes: DEFAULT_BOOKING_HOLD_DURATION_MINUTES,
      isHoldActive: false
    };
  }
}
