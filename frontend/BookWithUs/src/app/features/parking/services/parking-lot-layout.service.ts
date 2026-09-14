import { Injectable } from '@angular/core';
import { ParkingAvailability } from '../../../core/models/parking/parking-availability.model';

export type VehicleZoneType = 'threeWheeler' | 'car' | 'van';

export interface VisualParkingSlot {
  code: string;
  zoneKey: VehicleZoneType;
  zoneName: string;
  vehicleType: string;
  fee: number;
  status: 'Available' | 'Held' | 'Occupied';
}

@Injectable({
  providedIn: 'root'
})
export class ParkingLotLayoutService {
  /**
   * Generates the collection of parking slots matching the exact reference design:
   * - Three-Wheeler Zone: TW1 to TW12 (TW9, TW11 Held)
   * - Van Zone: V1 to V8 (V3 Held, V8 Occupied)
   * - Car Zone: C1 to C40 (C14, C26, C37 Held; C18, C31 Occupied)
   */
  getInitialSlots(): VisualParkingSlot[] {
    const slots: VisualParkingSlot[] = [];

    // 1. Three-Wheeler Zone (12 slots)
    for (let i = 1; i <= 12; i++) {
      const code = `TW${i}`;
      let status: 'Available' | 'Held' | 'Occupied' = 'Available';
      if (code === 'TW9' || code === 'TW11') {
        status = 'Held';
      }
      slots.push({
        code,
        zoneKey: 'threeWheeler',
        zoneName: 'Three-Wheeler Zone',
        vehicleType: 'Three-Wheeler',
        fee: 300,
        status
      });
    }

    // 2. Van Zone (8 slots)
    for (let i = 1; i <= 8; i++) {
      const code = `V${i}`;
      let status: 'Available' | 'Held' | 'Occupied' = 'Available';
      if (code === 'V3') {
        status = 'Held';
      } else if (code === 'V8') {
        status = 'Occupied';
      }
      slots.push({
        code,
        zoneKey: 'van',
        zoneName: 'Van Zone',
        vehicleType: 'Van',
        fee: 500,
        status
      });
    }

    // 3. Car Zone (40 slots)
    for (let i = 1; i <= 40; i++) {
      const code = `C${i}`;
      let status: 'Available' | 'Held' | 'Occupied' = 'Available';
      if (code === 'C14' || code === 'C26' || code === 'C37') {
        status = 'Held';
      } else if (code === 'C18' || code === 'C31') {
        status = 'Occupied';
      }
      slots.push({
        code,
        zoneKey: 'car',
        zoneName: 'Car Zone',
        vehicleType: 'Car',
        fee: 500,
        status
      });
    }

    return slots;
  }

  /**
   * Resolves a valid backend parking slot ID for reservation in BookingStateService.
   * Finds an available backend slot matching the vehicle type, or falls back to any available backend slot.
   */
  resolveBackendSlotId(
    visualSlot: VisualParkingSlot,
    backendSlots: readonly ParkingAvailability[]
  ): number {
    if (!backendSlots || backendSlots.length === 0) {
      return 6;
    }

    // Normalize vehicle type comparison
    const targetType = visualSlot.vehicleType.toLowerCase();

    // 1. Try to find an available backend slot matching vehicle type
    const matchingType = backendSlots.find(
      s => (s.status === 'Available' || (s as any).status === 1) && (
        s.vehicleType?.toLowerCase() === targetType ||
        (targetType.includes('three') && s.vehicleType?.toLowerCase().includes('motor')) ||
        (targetType.includes('car') && s.vehicleType?.toLowerCase().includes('car')) ||
        (targetType.includes('van') && s.vehicleType?.toLowerCase().includes('van'))
      )
    );

    if (matchingType) {
      return matchingType.id;
    }

    // 2. Fall back to any available online bookable slot
    const anyAvailable = backendSlots.find(
      s => (s.status === 'Available' || (s as any).status === 1) && s.isOnlineBookable
    );
    if (anyAvailable) {
      return anyAvailable.id;
    }

    // 3. Fallback to any available slot in general
    const anyGeneralAvailable = backendSlots.find(
      s => s.status === 'Available' || (s as any).status === 1
    );
    if (anyGeneralAvailable) {
      return anyGeneralAvailable.id;
    }

    // 4. Fallback to first slot or safe default 6
    return backendSlots[0]?.id ?? 6;
  }
}
