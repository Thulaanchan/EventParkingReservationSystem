import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ParkingAvailability } from '../../../../core/models/parking/parking-availability.model';
import { ParkingZone } from '../../../../core/models/parking/parking-zone.model';
import { ParkingSlotComponent } from '../parking-slot/parking-slot.component';
import { ParkingZoneComponent } from '../parking-zone/parking-zone.component';
import { ParkingLegendComponent } from '../parking-legend/parking-legend.component';

export interface ParkingMapZoneGroup {
  zone: ParkingZone;
  slots: ParkingAvailability[];
}

@Component({
  selector: 'app-parking-map',
  standalone: true,
  imports: [
    CommonModule,
    ParkingSlotComponent,
    ParkingZoneComponent,
    ParkingLegendComponent
  ],
  templateUrl: './parking-map.component.html',
  styleUrls: ['./parking-map.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ParkingMapComponent {
  /**
   * Complete collection of parking availability data for the event.
   */
  @Input() slots: readonly ParkingAvailability[] = [];

  /**
   * Parking zones metadata defining categories, ordering, fees, and booking rules.
   */
  @Input() zones: readonly ParkingZone[] = [];

  /**
   * At most ONE parking slot may be selected across the customer booking session.
   */
  @Input() selectedParkingSlotId: number | null = null;

  /**
   * Controls visibility of the status legend bar above the arena map.
   */
  @Input() showLegend = true;

  /**
   * Visual text label for the non-interactive venue entrance landmark banner.
   */
  @Input() entranceLabel = 'VENUE ENTRANCE \u2193';

  /**
   * Strongly typed event emitted when a customer selects an available parking slot.
   */
  @Output() slotSelect = new EventEmitter<ParkingAvailability>();

  /**
   * Checks whether coordinates are provided in the availability data to drive positioning.
   */
  get hasCoordinates(): boolean {
    return (
      this.slots.length > 0 &&
      this.slots.some(s => s.positionX != null && s.positionY != null)
    );
  }

  /**
   * Dynamically calculates canvas width for coordinate-positioned slots.
   */
  get canvasWidth(): number {
    if (!this.hasCoordinates) {
      return 900;
    }
    let maxX = 0;
    for (const s of this.slots) {
      if (s.positionX != null && s.positionX > maxX) {
        maxX = s.positionX;
      }
    }
    return Math.max(900, Math.ceil(maxX + 80));
  }

  /**
   * Dynamically calculates canvas height for coordinate-positioned slots.
   */
  get canvasHeight(): number {
    if (!this.hasCoordinates) {
      return 650;
    }
    let maxY = 0;
    for (const s of this.slots) {
      if (s.positionY != null && s.positionY > maxY) {
        maxY = s.positionY;
      }
    }
    return Math.max(650, Math.ceil(maxY + 80));
  }

  /**
   * Derives ordered zone groups for fallback presentation when coordinates are absent.
   * Respects backend displayOrder and associates slots to their zones.
   */
  get groupedZones(): readonly ParkingMapZoneGroup[] {
    if (this.zones.length > 0) {
      // Sort zones by displayOrder, then by id
      const sortedZones = [...this.zones].sort(
        (a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0) || a.id - b.id
      );

      const zoneIds = new Set(sortedZones.map(z => z.id));
      const groups: ParkingMapZoneGroup[] = sortedZones.map(zone => ({
        zone,
        slots: this.slots.filter(s => s.zoneId === zone.id)
      }));

      // Group any orphaned slots whose zoneId is not present in zones input
      const unassignedSlots = this.slots.filter(s => !zoneIds.has(s.zoneId));
      if (unassignedSlots.length > 0) {
        const fallbackZone: ParkingZone = {
          id: -1,
          eventId: unassignedSlots[0]?.zoneId ?? 0,
          name: unassignedSlots[0]?.zoneName || 'General Parking',
          vehicleType: unassignedSlots[0]?.vehicleType || 'Car',
          fee: unassignedSlots[0]?.fee ?? 0,
          isOnlineBookable: unassignedSlots.some(s => s.isOnlineBookable),
          displayOrder: 999,
          slotCount: unassignedSlots.length
        };
        groups.push({ zone: fallbackZone, slots: unassignedSlots });
      }

      return groups;
    }

    // If no zones were supplied, dynamically group slots by zoneId
    const map = new Map<number, ParkingMapZoneGroup>();
    for (const slot of this.slots) {
      const zId = slot.zoneId;
      if (!map.has(zId)) {
        const syntheticZone: ParkingZone = {
          id: zId,
          eventId: 0,
          name: slot.zoneName || `Zone ${zId}`,
          vehicleType: slot.vehicleType || 'Car',
          fee: slot.fee ?? 0,
          isOnlineBookable: slot.isOnlineBookable,
          displayOrder: zId,
          slotCount: 0
        };
        map.set(zId, { zone: syntheticZone, slots: [] });
      }
      map.get(zId)!.slots.push(slot);
    }

    return Array.from(map.values());
  }

  /**
   * Fast check for selected slot state.
   */
  isSlotSelected(slotId: number): boolean {
    return this.selectedParkingSlotId === slotId;
  }

  /**
   * Re-emits slot selection upward.
   */
  onSlotSelect(slot: ParkingAvailability): void {
    this.slotSelect.emit(slot);
  }
}
