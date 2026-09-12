import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Presentation projection for a seat on the admin seat map.
 * Fully decoupled from incomplete M3 domain models.
 */
export interface AdminSeatMapItem {
  id: number;
  seatCode: string;
  sectionId: number;
  sectionName: string;
  categoryName: string;
  status: 'Available' | 'Held' | 'Booked';
  positionX: number | null;
  positionY: number | null;
}

/**
 * Presentational visual component for rendering the admin seat map canvas.
 * Matches arena layout with central stage and dynamic concentric category badges.
 * Supports viewing any seat regardless of status.
 */
@Component({
  selector: 'app-admin-seat-map',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-seat-map.component.html',
  styleUrl: './admin-seat-map.component.css'
})
export class AdminSeatMapComponent {
  @Input() seats: readonly AdminSeatMapItem[] = [];
  @Input() selectedSeatId: number | null = null;
  @Input() zoomPercent = 100;
  @Input() offsetX = 0;
  @Input() offsetY = 0;
  @Input() disabled = false;

  @Output() seatSelected = new EventEmitter<AdminSeatMapItem>();

  /**
   * Derives unique category names from real seat items without mutating input.
   */
  get dynamicCategories(): readonly string[] {
    const categories: string[] = [];
    for (const seat of this.seats) {
      const name = (seat.categoryName ?? '').trim();
      if (name && !categories.includes(name)) {
        categories.push(name);
      }
    }
    return categories;
  }

  get positionedSeats(): AdminSeatMapItem[] {
    return this.seats.filter(
      (s): s is AdminSeatMapItem & { positionX: number; positionY: number } =>
        s.positionX !== null &&
        s.positionX !== undefined &&
        s.positionY !== null &&
        s.positionY !== undefined &&
        !isNaN(Number(s.positionX)) &&
        !isNaN(Number(s.positionY))
    );
  }

  get unpositionedSeats(): AdminSeatMapItem[] {
    return this.seats.filter(
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

  get viewBox(): string {
    if (this.positionedSeats.length === 0) {
      return '0 0 1200 900';
    }

    let minX = 0;
    let maxX = 1200;
    let minY = 0;
    let maxY = 900;

    for (const seat of this.positionedSeats) {
      minX = Math.min(minX, Number(seat.positionX) - 50);
      maxX = Math.max(maxX, Number(seat.positionX) + 50);
      minY = Math.min(minY, Number(seat.positionY) - 50);
      maxY = Math.max(maxY, Number(seat.positionY) + 50);
    }

    const width = Math.max(1200, Math.round(maxX - minX));
    const height = Math.max(900, Math.round(maxY - minY));
    return `${Math.round(minX)} ${Math.round(minY)} ${width} ${height}`;
  }

  getCategoryBadgeY(index: number, total: number): number {
    const startY = 165;
    const spacing = total > 1 ? Math.min(50, 160 / total) : 0;
    return startY + index * spacing;
  }

  getCategoryBadgeWidth(categoryName: string): number {
    return Math.max(76, categoryName.length * 9 + 24);
  }

  getCategoryColorIndex(index: number): number {
    return index % 6;
  }

  onSeatClick(seat: AdminSeatMapItem): void {
    if (!this.disabled) {
      this.seatSelected.emit(seat);
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'Available':
        return 'status-available';
      case 'Held':
        return 'status-held';
      case 'Booked':
        return 'status-booked';
      default:
        return 'status-unknown';
    }
  }

  getAriaLabel(seat: AdminSeatMapItem): string {
    const sectionInfo = seat.sectionName ? ` (${seat.sectionName})` : '';
    const selectedText = seat.id === this.selectedSeatId ? ', Selected' : '';
    return `Seat ${seat.seatCode} - ${seat.status}${sectionInfo}${selectedText}`;
  }
}
