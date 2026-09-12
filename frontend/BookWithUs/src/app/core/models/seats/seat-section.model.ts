export interface SeatSection {
  id: number;
  eventId: number;
  eventSeatCategoryId: number;
  code: string;
  name: string;
  categoryName: string;
  displayOrder: number;
  seatCount: number;
}

export type SeatSectionDto = SeatSection;
