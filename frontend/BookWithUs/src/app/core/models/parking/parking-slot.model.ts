import { ParkingStatusName } from './parking-status.model';
import { VehicleTypeName } from './vehicle-type.model';

export interface ParkingSlot {
  id: number;
  eventId: number;
  parkingZoneId: number;
  slotCode: string;
  status: ParkingStatusName;
  zoneName: string;
  vehicleType: VehicleTypeName;
  fee: number;
  isOnlineBookable: boolean;
  displayOrder: number;
  positionX: number | null;
  positionY: number | null;
}
