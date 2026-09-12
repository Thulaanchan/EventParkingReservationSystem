import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Local presentation projection for a parking zone on the map.
 * Fully decoupled from incomplete M3 domain models.
 */
export interface AdminParkingMapZone {
  id: number;
  name: string;
  vehicleType: string;
  isOnlineBookable: boolean;
}

/**
 * Local presentation projection for a parking slot on the map.
 * Fully decoupled from incomplete M3 domain models.
 */
export interface AdminParkingMapSlot {
  id: number;
  slotCode: string;
  zoneId: number;
  zoneName: string;
  vehicleType: string;
  status: 'Available' | 'Held' | 'Occupied';
  isOnlineBookable: boolean;
  positionX: number | null;
  positionY: number | null;
}

/**
 * Presentational visual component for rendering the admin parking layout map.
 * Supports viewing any slot regardless of status (Available, Held, Occupied).
 * Strictly renders dynamic zones and slots supplied via inputs without hardcoding screenshot counts or types.
 */
@Component({
  selector: 'app-admin-parking-map',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-parking-map.component.html',
  styleUrl: './admin-parking-map.component.css'
})
export class AdminParkingMapComponent {
  @Input() zones: readonly AdminParkingMapZone[] = [];
  @Input() slots: readonly AdminParkingMapSlot[] = [];
  @Input() selectedSlotId: number | null = null;
  @Input() zoomPercent = 100;
  @Input() offsetX = 0;
  @Input() offsetY = 0;
  @Input() disabled = false;

  @Output() slotSelected = new EventEmitter<AdminParkingMapSlot>();

  get positionedSlots(): AdminParkingMapSlot[] {
    return this.slots.filter(
      (s): s is AdminParkingMapSlot & { positionX: number; positionY: number } =>
        s.positionX !== null &&
        s.positionX !== undefined &&
        s.positionY !== null &&
        s.positionY !== undefined &&
        !isNaN(Number(s.positionX)) &&
        !isNaN(Number(s.positionY))
    );
  }

  get unpositionedSlots(): AdminParkingMapSlot[] {
    return this.slots.filter(
      (s) =>
        s.positionX === null ||
        s.positionX === undefined ||
        s.positionY === null ||
        s.positionY === undefined ||
        isNaN(Number(s.positionX)) ||
        isNaN(Number(s.positionY))
    );
  }

  get clampedZoom(): number {
    const val = this.zoomPercent ?? 100;
    if (isNaN(val)) {
      return 100;
    }
    return Math.max(25, Math.min(400, Math.round(val)));
  }

  get clampedOffsetX(): number {
    const val = this.offsetX ?? 0;
    if (isNaN(val)) {
      return 0;
    }
    return Math.max(-2000, Math.min(2000, Math.round(val)));
  }

  get clampedOffsetY(): number {
    const val = this.offsetY ?? 0;
    if (isNaN(val)) {
      return 0;
    }
    return Math.max(-2000, Math.min(2000, Math.round(val)));
  }

  get transformStyle(): string {
    const scale = this.clampedZoom / 100;
    return `translate(${this.clampedOffsetX}px, ${this.clampedOffsetY}px) scale(${scale})`;
  }

  getUnpositionedSlotsForZone(zoneId: number): AdminParkingMapSlot[] {
    return this.unpositionedSlots.filter((s) => s.zoneId === zoneId);
  }

  getSlotsForZone(zoneId: number): AdminParkingMapSlot[] {
    return this.slots.filter((s) => s.zoneId === zoneId);
  }

  getVehicleTypeDisplay(type: string | null | undefined): string {
    switch (type) {
      case 'ThreeWheeler':
        return 'Three-Wheeler';
      case 'Car':
        return 'Car';
      case 'Van':
        return 'Van';
      case 'Motorbike':
        return 'Motorbike';
      default:
        return type ?? 'Standard Vehicle';
    }
  }

  getVehicleIconClass(type: string | null | undefined): string {
    switch (type) {
      case 'ThreeWheeler':
        return 'icon-three-wheeler';
      case 'Car':
        return 'icon-car';
      case 'Van':
        return 'icon-van';
      case 'Motorbike':
        return 'icon-motorbike';
      default:
        return 'icon-default';
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'Available':
        return 'status-available';
      case 'Held':
        return 'status-held';
      case 'Occupied':
        return 'status-occupied';
      default:
        return 'status-unknown';
    }
  }

  getAriaLabel(slot: AdminParkingMapSlot): string {
    const isSelected = slot.id === this.selectedSlotId ? ', Selected' : '';
    const online = slot.isOnlineBookable ? 'Online Booking Enabled' : 'Offline / Reserved';
    const vehicle = this.getVehicleTypeDisplay(slot.vehicleType);
    return `Slot ${slot.slotCode} - ${slot.zoneName} (${vehicle}), Status: ${slot.status}, ${online}${isSelected}`;
  }

  onSelectSlot(slot: AdminParkingMapSlot): void {
    if (!this.disabled) {
      this.slotSelected.emit(slot);
    }
  }
}
