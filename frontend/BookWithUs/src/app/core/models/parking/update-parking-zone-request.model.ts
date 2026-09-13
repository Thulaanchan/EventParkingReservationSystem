import { VehicleType } from './vehicle-type.model';

export interface UpdateParkingZoneRequest {
  name: string;
  vehicleType: VehicleType;
  fee: number;
  isOnlineBookable: boolean;
  displayOrder: number;
}
