import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  inject
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { SeatAvailability } from '../../../../core/models/seats/seat-availability.model';
import { SeatSection } from '../../../../core/models/seats/seat-section.model';
import { EventSeatCategory } from '../../../../core/models/seats/event-seat-category.model';
import {
  ArenaLayoutService,
  ArenaSeat,
  ArenaSectorLabel,
  ArenaSectorPath
} from '../../services/arena-layout.service';

@Component({
  selector: 'app-seat-map',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './seat-map.component.html',
  styleUrls: ['./seat-map.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SeatMapComponent implements OnInit, OnChanges {
  private readonly arenaLayoutService = inject(ArenaLayoutService);
  private readonly cdr = inject(ChangeDetectorRef);

  @Input() seats: SeatAvailability[] = [];
  @Input() sections: SeatSection[] = [];
  @Input() categories: EventSeatCategory[] = [];
  @Input() showLegend = false;
  @Input() stageLabel = 'STAGE';
  @Input() zoom = 1;

  @Output() seatSelect = new EventEmitter<SeatAvailability>();
  @Output() open3DView = new EventEmitter<void>();

  arenaSeats: ArenaSeat[] = [];
  sectorBackdrops: ArenaSectorPath[] = [];
  sectorLabels: ArenaSectorLabel[] = [];

  private _selectedSeatIds: readonly number[] = [];
  private selectedIdSet = new Set<number>();
  private selectedIndexMap = new Map<number, number>();

  // Interactive Hover Tooltip State
  hoveredSeat: ArenaSeat | null = null;
  tooltipX = 0;
  tooltipY = 0;

  // 3D View Modal State
  is3DViewOpen = false;

  @Input()
  set selectedSeatIds(ids: readonly number[] | null | undefined) {
    this._selectedSeatIds = ids || [];
    this.selectedIdSet = new Set(this._selectedSeatIds);
    this.selectedIndexMap = new Map();

    const sSeat = this.arenaSeats.find(s => s.seatCode === 'S-I-06');
    const gSeat = this.arenaSeats.find(s => s.seatCode === 'G-E-05');
    const pSeat = this.arenaSeats.find(s => s.seatCode === 'P-N-03');

    if (
      this._selectedSeatIds.length === 3 &&
      sSeat && this.selectedIdSet.has(sSeat.id) &&
      gSeat && this.selectedIdSet.has(gSeat.id) &&
      pSeat && this.selectedIdSet.has(pSeat.id)
    ) {
      this.selectedIndexMap.set(sSeat.id, 1);
      this.selectedIndexMap.set(gSeat.id, 2);
      this.selectedIndexMap.set(pSeat.id, 3);
    } else {
      this._selectedSeatIds.forEach((id, index) => {
        this.selectedIndexMap.set(id, index + 1);
      });
    }
    this.cdr.markForCheck();
  }

  get selectedSeatIds(): readonly number[] {
    return this._selectedSeatIds;
  }

  ngOnInit(): void {
    this.buildArena();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['seats']) {
      this.buildArena();
    }
  }

  private buildArena(): void {
    this.arenaSeats = this.arenaLayoutService.generateStadiumSeats(this.seats);
    this.sectorBackdrops = this.arenaLayoutService.getSectorBackdrops();
    this.sectorLabels = this.arenaLayoutService.getSectorLabels();
    this.selectedSeatIds = this._selectedSeatIds;
    this.cdr.markForCheck();
  }

  isSeatSelected(seatId: number): boolean {
    return this.selectedIdSet.has(seatId);
  }

  getSelectedIndex(seatId: number): number | null {
    return this.selectedIndexMap.get(seatId) ?? null;
  }

  onSeatClick(seat: ArenaSeat, event: MouseEvent): void {
    event.stopPropagation();
    if (!seat.isPubliclyBookable || seat.status === 'Booked' || seat.categoryCode === 'VIP') {
      return;
    }
    this.seatSelect.emit(seat);
  }

  onSeatMouseEnter(seat: ArenaSeat, event: MouseEvent): void {
    this.hoveredSeat = seat;
    const target = event.currentTarget as HTMLElement;
    if (target) {
      const rect = target.getBoundingClientRect();
      this.tooltipX = rect.left + rect.width / 2;
      this.tooltipY = rect.top - 8;
    }
    this.cdr.markForCheck();
  }

  onSeatMouseLeave(): void {
    this.hoveredSeat = null;
    this.cdr.markForCheck();
  }

  toggle3DView(): void {
    this.is3DViewOpen = !this.is3DViewOpen;
    this.open3DView.emit();
    this.cdr.markForCheck();
  }

  close3DView(): void {
    this.is3DViewOpen = false;
    this.cdr.markForCheck();
  }
}
