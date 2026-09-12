import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { SeatSection } from '../../../../core/models/seats/seat-section.model';
import { SeatAvailability } from '../../../../core/models/seats/seat-availability.model';
import { SeatItemComponent } from '../seat-item/seat-item.component';

@Component({
  selector: 'app-seat-section',
  standalone: true,
  imports: [CommonModule, SeatItemComponent],
  templateUrl: './seat-section.component.html',
  styleUrls: ['./seat-section.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SeatSectionComponent {
  /**
   * The section metadata contract.
   */
  @Input({ required: true }) section!: SeatSection;

  /**
   * Collection of seats belonging to this section.
   */
  @Input() seats: readonly SeatAvailability[] = [];

  /**
   * Emits when a customer clicks a selectable seat within this section.
   */
  @Output() seatSelect = new EventEmitter<SeatAvailability>();

  private _selectedSeatIds: readonly number[] = [];
  private selectedIdSet = new Set<number>();
  private selectedIndexMap = new Map<number, number>();

  /**
   * Ordered list of selected seat IDs for O(1) selection and sequential badge lookup.
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

  isSeatSelected(seatId: number): boolean {
    return this.selectedIdSet.has(seatId);
  }

  getSelectedIndex(seatId: number): number | null {
    return this.selectedIndexMap.get(seatId) ?? null;
  }

  onSeatSelect(seat: SeatAvailability): void {
    this.seatSelect.emit(seat);
  }
}
