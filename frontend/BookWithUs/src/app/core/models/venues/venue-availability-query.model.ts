export interface VenueAvailabilityQuery {
  date: string;
  start: string;
  end: string;
  excludeEventId?: number;
}
