import { VehicleType } from './vehicle-type.model';

export interface CreateParkingZoneRequest {
  name: string;
  vehicleType: VehicleType;
  fee: number;
  isOnlineBookable?: boolean;
  displayOrder: number;
}
