export interface EventSeatCategory {
  id: number;
  eventId: number;
  name: string;
  code: string;
  adultPrice: number;
  childPrice: number;
  isPubliclyBookable: boolean;
  displayOrder: number;
}

export type EventSeatCategoryDto = EventSeatCategory;
