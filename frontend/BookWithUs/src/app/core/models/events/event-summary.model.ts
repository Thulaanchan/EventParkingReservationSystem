export interface EventSummary {
  id: number;
  name: string;
  posterUrl: string | null;
  eventDate: string;
  startTime: string;
  endTime: string;
  ticketPrice: number;
  childDiscountPercent: number;
  venueId: number;
  venueName: string;
  categoryId: number;
  categoryName: string;
  capacity: number | null;
  totalSeats: number;
  availableSeats: number;
  bookedSeats: number;
  soldPercentage: number;
  hasBookings: boolean;
  canDelete: boolean;
}

export type EventListItem = EventSummary;
