import { ParkingStatusName } from './parking-status.model';
import { VehicleTypeName } from './vehicle-type.model';

export interface ParkingAvailability {
  id: number;
  slotCode: string;
  status: ParkingStatusName;
  zoneId: number;
  zoneName: string;
  vehicleType: VehicleTypeName;
  fee: number;
  isOnlineBookable: boolean;
  positionX: number | null;
  positionY: number | null;
}
