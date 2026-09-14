import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { VisualParkingSlot } from '../../services/parking-lot-layout.service';

@Component({
  selector: 'app-parking-map',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './parking-map.component.html',
  styleUrls: ['./parking-map.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ParkingMapComponent {
  /**
   * Currently selected slot code (e.g. 'C13')
   */
  @Input() selectedSlotCode: string | null = 'C13';

  /**
   * All visual parking slots in the arena layout.
   */
  @Input() slots: readonly VisualParkingSlot[] = [];

  /**
   * Emitted when user clicks an available parking slot.
   */
  @Output() slotSelect = new EventEmitter<VisualParkingSlot>();

  get twRow1(): VisualParkingSlot[] {
    return this.slots.filter(s => s.zoneKey === 'threeWheeler').slice(0, 6);
  }

  get twRow2(): VisualParkingSlot[] {
    return this.slots.filter(s => s.zoneKey === 'threeWheeler').slice(6, 12);
  }

  get vanRow1(): VisualParkingSlot[] {
    return this.slots.filter(s => s.zoneKey === 'van').slice(0, 4);
  }

  get vanRow2(): VisualParkingSlot[] {
    return this.slots.filter(s => s.zoneKey === 'van').slice(4, 8);
  }

  get carRow1(): VisualParkingSlot[] {
    return this.slots.filter(s => s.zoneKey === 'car').slice(0, 10);
  }

  get carRow2(): VisualParkingSlot[] {
    return this.slots.filter(s => s.zoneKey === 'car').slice(10, 20);
  }

  get carRow3(): VisualParkingSlot[] {
    return this.slots.filter(s => s.zoneKey === 'car').slice(20, 30);
  }

  get carRow4(): VisualParkingSlot[] {
    return this.slots.filter(s => s.zoneKey === 'car').slice(30, 40);
  }

  isSelected(slot: VisualParkingSlot): boolean {
    return this.selectedSlotCode === slot.code;
  }

  onSlotClick(slot: VisualParkingSlot): void {
    if (slot.status !== 'Available') {
      return;
    }
    this.slotSelect.emit(slot);
  }
}
