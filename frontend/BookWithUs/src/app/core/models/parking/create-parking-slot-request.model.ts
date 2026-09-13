export interface CreateParkingSlotRequest {
  parkingZoneId: number;
  slotCode: string;
  displayOrder: number;
  positionX?: number | null;
  positionY?: number | null;
}
