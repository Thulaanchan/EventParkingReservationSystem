export interface VenueAvailabilityConflict {
  eventId: number;
  eventName: string;
  startTime: string;
  endTime: string;
}

export interface VenueAvailability {
  venueId: number;
  date: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  conflicts: VenueAvailabilityConflict[];
}
