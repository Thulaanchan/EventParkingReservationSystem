import { VehicleTypeName } from './vehicle-type.model';

export interface ParkingZone {
  id: number;
  eventId: number;
  name: string;
  vehicleType: VehicleTypeName;
  fee: number;
  isOnlineBookable: boolean;
  displayOrder: number;
  slotCount: number;
}
