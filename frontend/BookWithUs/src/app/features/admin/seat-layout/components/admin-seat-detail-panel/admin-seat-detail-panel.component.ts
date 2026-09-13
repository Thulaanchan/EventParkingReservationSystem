import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';

/**
 * Lightweight local UI projection for Admin Seat Details view.
 * Decoupled from incomplete M3 domain models.
 */
export interface AdminSeatDetailView {
  id: number;
  seatCode: string;
  rowLabel: string;
  number: number;
  sectionName: string;
  categoryName: string;
  adultPrice: number;
  childPrice: number;
  isPubliclyBookable: boolean;
  status: 'Available' | 'Held' | 'Booked';
  positionX?: number | null;
  positionY?: number | null;
}

/**
 * Presentational component for the Admin Seat Detail drawer/panel.
 * Matches the right-side Seat Details panel in ad s 06 m.png.
 */
@Component({
  selector: 'app-admin-seat-detail-panel',
  standalone: true,
  imports: [CommonModule, DecimalPipe],
  templateUrl: './admin-seat-detail-panel.component.html',
  styleUrl: './admin-seat-detail-panel.component.css'
})
export class AdminSeatDetailPanelComponent {
  @Input() seat: AdminSeatDetailView | null = null;
  @Input() deleting = false;
  @Input() disabled = false;

  @Output() editSeat = new EventEmitter<AdminSeatDetailView>();
  @Output() deleteSeat = new EventEmitter<AdminSeatDetailView>();
  @Output() closePanel = new EventEmitter<void>();

  get isLocked(): boolean {
    if (!this.seat) {
      return true;
    }
    return this.seat.status !== 'Available';
  }

  get lockMessage(): string | null {
    if (!this.seat) {
      return null;
    }
    if (this.seat.status === 'Booked') {
      return 'This seat is booked and cannot be edited or deleted.';
    }
    if (this.seat.status === 'Held') {
      return 'This seat is temporarily held and cannot be edited or deleted.';
    }
    return null;
  }

  getStatusClass(status: string | null | undefined): string {
    switch (status) {
      case 'Available':
        return 'status-available';
      case 'Held':
        return 'status-held';
      case 'Booked':
        return 'status-booked';
      default:
        return 'status-neutral';
    }
  }

  onEdit(): void {
    if (this.seat && !this.isLocked && !this.disabled && !this.deleting) {
      this.editSeat.emit(this.seat);
    }
  }

  onDelete(): void {
    if (this.seat && !this.isLocked && !this.disabled && !this.deleting) {
      this.deleteSeat.emit(this.seat);
    }
  }

  onClose(): void {
    this.closePanel.emit();
  }
}
