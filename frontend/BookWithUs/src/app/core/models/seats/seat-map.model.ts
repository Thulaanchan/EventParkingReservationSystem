import { SeatAvailability } from './seat-availability.model';
import { SeatSection } from './seat-section.model';

/**
 * Frontend presentation/aggregation model for organizing the interactive seat map.
 * Groups seat availability data and sections for an event.
 */
export interface SeatMap {
  eventId: number;
  seats: SeatAvailability[];
  sections?: SeatSection[];
}
