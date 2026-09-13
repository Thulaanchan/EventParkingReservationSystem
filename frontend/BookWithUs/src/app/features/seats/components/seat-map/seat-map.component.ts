import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { SeatAvailability } from '../../../../core/models/seats/seat-availability.model';
import { SeatSection } from '../../../../core/models/seats/seat-section.model';
import { EventSeatCategory } from '../../../../core/models/seats/event-seat-category.model';
import { SeatItemComponent } from '../seat-item/seat-item.component';
import { SeatLegendComponent } from '../seat-legend/seat-legend.component';

export interface SeatSectionGroup {
  sectionCode: string;
  sectionName: string;
  seats: SeatAvailability[];
}

@Component({
  selector: 'app-seat-map',
  standalone: true,
  imports: [CommonModule, SeatItemComponent, SeatLegendComponent],
  templateUrl: './seat-map.component.html',
  styleUrls: ['./seat-map.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SeatMapComponent {
  /**
   * Complete collection of seat availability data for the event.
   */
  @Input() seats: SeatAvailability[] = [];

  /**
   * Optional section metadata for organizing seating sections.
   */
  @Input() sections: SeatSection[] = [];

  /**
   * Optional backend seat categories used to populate the legend.
   */
  @Input() categories: EventSeatCategory[] = [];

  /**
   * Display label for the non-interactive central stage indicator.
   */
  @Input() stageLabel = 'STAGE';

  /**
   * Controls whether the top status/category legend is displayed.
   */
  @Input() showLegend = true;

  /**
   * Strongly typed output emitted when an available seat is selected or deselected.
   * Re-emits the SeatAvailability payload upward to the parent page.
   */
  @Output() seatSelect = new EventEmitter<SeatAvailability>();

  private _selectedSeatIds: readonly number[] = [];
  private selectedIdSet = new Set<number>();
  private selectedIndexMap = new Map<number, number>();

  /**
   * Ordered list of selected seat IDs.
   * Maintains the customer's selection order to assign 1-based index badges (1, 2, 3...)
   * as shown in the finalized reference screen (screen-09.png).
   */
  @Input()
  set selectedSeatIds(ids: readonly number[] | null | undefined) {
    this._selectedSeatIds = ids || [];
    this.selectedIdSet = new Set(this._selectedSeatIds);
    this.selectedIndexMap = new Map();
    this._selectedSeatIds.forEach((id, index) => {
      this.selectedIndexMap.set(id, index + 1);
    });
  }

  get selectedSeatIds(): readonly number[] {
    return this._selectedSeatIds;
  }

  /**
   * Checks whether coordinates are available in the data set to drive the visual arena map.
   */
  get hasCoordinates(): boolean {
    return this.seats.length > 0 && this.seats.some(s => s.positionX != null && s.positionY != null);
  }

  /**
   * Calculates the canvas width dynamically to accommodate all positioned seats with padding.
   */
  get canvasWidth(): number {
    if (!this.hasCoordinates) {
      return 800;
    }
    let maxX = 0;
    for (const s of this.seats) {
      if (s.positionX != null && s.positionX > maxX) {
        maxX = s.positionX;
      }
    }
    return Math.max(700, Math.ceil(maxX + 60));
  }

  /**
   * Calculates the canvas height dynamically to accommodate all positioned seats with padding.
   */
  get canvasHeight(): number {
    if (!this.hasCoordinates) {
      return 600;
    }
    let maxY = 0;
    for (const s of this.seats) {
      if (s.positionY != null && s.positionY > maxY) {
        maxY = s.positionY;
      }
    }
    return Math.max(550, Math.ceil(maxY + 60));
  }

  /**
   * Central stage positioning coordinates on the canvas.
   */
  get stagePosition(): { x: number; y: number } {
    return {
      x: Math.round(this.canvasWidth / 2),
      y: Math.round(this.canvasHeight / 2)
    };
  }

  /**
   * Fallback grouping by section for seat collections without position coordinates.
   */
  get groupedSeats(): SeatSectionGroup[] {
    const map = new Map<string, SeatSectionGroup>();
    for (const seat of this.seats) {
      const code = seat.sectionCode || 'General';
      const name = seat.sectionName || code;
      if (!map.has(code)) {
        map.set(code, { sectionCode: code, sectionName: name, seats: [] });
      }
      map.get(code)!.seats.push(seat);
    }
    return Array.from(map.values());
  }

  /**
   * O(1) selection check.
   */
  isSeatSelected(seatId: number): boolean {
    return this.selectedIdSet.has(seatId);
  }

  /**
   * O(1) 1-based sequential selection order index for the seat badge.
   */
  getSelectedIndex(seatId: number): number | null {
    return this.selectedIndexMap.get(seatId) ?? null;
  }

  /**
   * Re-emits the child SeatItemComponent selection upward.
   */
  onSeatSelect(seat: SeatAvailability): void {
    this.seatSelect.emit(seat);
  }
}
