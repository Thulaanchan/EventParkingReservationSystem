import { EventSummary } from './event-summary.model';

export interface EventDetails extends EventSummary {
  description: string | null;
  stageLayout: string | null;
  venueAddress: string;
  venueCapacity: number;
  bookingCount: number;
  canEditTicketPrice: boolean;
  canEditCapacity: boolean;
  canEditStageLayout: boolean;
}
