export interface UpdateEventRequest {
  name: string;
  description?: string | null;
  venueId: number;
  categoryId: number;
  eventDate: string;
  startTime: string;
  endTime: string;
  ticketPrice: number;
  capacity: number;
  stageLayout?: string | null;
  poster?: File | null;
}
