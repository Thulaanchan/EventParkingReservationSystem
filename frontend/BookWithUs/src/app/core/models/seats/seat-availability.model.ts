import { SeatStatusName } from './seat-status.model';

export interface SeatAvailability {
  id: number;
  seatCode: string;
  rowLabel: string;
  number: number;
  sectionId: number;
  sectionCode: string;
  sectionName: string;
  categoryCode: string;
  categoryName: string;
  adultPrice: number;
  childPrice: number;
  isPubliclyBookable: boolean;
  status: SeatStatusName;
  positionX: number | null;
  positionY: number | null;
}

export type SeatAvailabilityDto = SeatAvailability;
