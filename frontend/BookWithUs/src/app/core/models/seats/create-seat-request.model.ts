export interface CreateSeatRequest {
  seatSectionId: number;
  rowLabel: string;
  number: number;
  displayOrder: number;
  positionX: number | null;
  positionY: number | null;
}
