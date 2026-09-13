import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ParkingAvailability } from '../../../../core/models/parking/parking-availability.model';

@Component({
  selector: 'app-parking-slot',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './parking-slot.component.html',
  styleUrls: ['./parking-slot.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ParkingSlotComponent {
  /**
   * Strongly typed parking availability data for this slot.
   */
  @Input({ required: true }) slot!: ParkingAvailability;

  /**
   * Client UI selection state (at most one slot selected across the booking).
   */
  @Input() selected = false;

  /**
   * Emits the selected ParkingAvailability object upward to the parent zone/map.
   */
  @Output() slotSelect = new EventEmitter<ParkingAvailability>();

  /**
   * A slot is selectable only if it is Available and marked online bookable.
   */
  get isSelectable(): boolean {
    return this.slot.status === 'Available' && this.slot.isOnlineBookable;
  }

  get isHeld(): boolean {
    return this.slot.status === 'Held';
  }

  get isOccupied(): boolean {
    return this.slot.status === 'Occupied';
  }

  get isOffline(): boolean {
    return !this.slot.isOnlineBookable;
  }

  get statusLabel(): string {
    if (this.selected) {
      return 'Selected';
    }
    if (this.isOffline) {
      return 'Not Available for Online Booking';
    }
    if (this.isHeld) {
      return 'Held';
    }
    if (this.isOccupied) {
      return 'Occupied';
    }
    return 'Available';
  }

  get ariaLabel(): string {
    return `Parking slot ${this.slot.slotCode}, ${this.slot.zoneName || this.slot.vehicleType}, ${this.statusLabel}`;
  }

  onSelect(): void {
    if (this.isSelectable || this.selected) {
      this.slotSelect.emit(this.slot);
    }
  }
}
