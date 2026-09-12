export interface UpdateSeatRequest {
  seatSectionId: number;
  rowLabel: string;
  number: number;
  displayOrder: number;
  positionX: number | null;
  positionY: number | null;
}

export type UpdateSeatRequestDto = UpdateSeatRequest;
