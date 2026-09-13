import { VehicleTypeName } from './vehicle-type.model';

/**
 * Frontend-only presentation contract for displaying parking fee information.
 * Authoritative fee is derived strictly from ParkingZone.Fee or ParkingAvailability.Fee.
 * Does NOT invent taxes, service charges, or unverified fees.
 */
export interface ParkingFeeSummary {
  zoneId: number;
  zoneName: string;
  vehicleType: VehicleTypeName;
  fee: number;
}

