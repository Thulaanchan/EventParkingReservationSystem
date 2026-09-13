import { ParkingAvailability } from './parking-availability.model';
import { ParkingZone } from './parking-zone.model';

/**
 * Frontend aggregation model grouping parking availability data with zone metadata.
 * Does not invent backend fields or hardcode static coordinates.
 */
export interface ParkingMapData {
  eventId: number;
  slots: ParkingAvailability[];
  zones: ParkingZone[];
}
