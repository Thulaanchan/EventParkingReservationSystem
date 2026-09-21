export interface CreateEventSeatCategoryRequest {
  name: string;
  code: string;
  adultPrice: number;
  isPubliclyBookable?: boolean;
  displayOrder?: number;
}
