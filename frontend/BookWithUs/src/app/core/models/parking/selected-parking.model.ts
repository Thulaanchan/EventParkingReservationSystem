import { VehicleTypeName } from './vehicle-type.model';

/**
 * Client UI state representing a customer's single chosen parking slot selection.
 * Transient state preserved in client memory during the booking flow.
 */
export interface SelectedParking {
  parkingSlotId: number;
  slotCode: string;
  zoneId: number;
  zoneName: string;
  vehicleType: VehicleTypeName;
  fee: number;
}
