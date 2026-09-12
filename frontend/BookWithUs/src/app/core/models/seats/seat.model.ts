import { SeatStatusName } from './seat-status.model';

export interface Seat {
  id: number;
  eventId: number;
  seatSectionId: number;
  seatCode: string;
  rowLabel: string;
  number: number;
  sectionCode: string;
  sectionName: string;
  categoryCode: string;
  categoryName: string;
  adultPrice: number;
  childPrice: number;
  isPubliclyBookable: boolean;
  status: SeatStatusName;
  displayOrder: number;
  positionX: number | null;
  positionY: number | null;
}

export type SeatDto = Seat;
