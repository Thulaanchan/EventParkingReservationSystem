import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface ParkingStatusLegendItem {
  id: string;
  label: string;
  description: string;
  visualClass: string;
}

/**
 * Presentational component for Admin Parking toolbar and status legend.
 * Exposes toolbar events and renders real backend status markers alongside local admin UI selection.
 * Fully decoupled from incomplete M3 domain models.
 */
@Component({
  selector: 'app-admin-parking-actions',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-parking-actions.component.html',
  styleUrl: './admin-parking-actions.component.css'
})
export class AdminParkingActionsComponent {
  @Input() refreshing = false;
  @Input() slotListOpen = false;
  @Input() zoomPercent = 100;
  @Input() disabled = false;

  @Output() resetView = new EventEmitter<void>();
  @Output() zoomIn = new EventEmitter<void>();
  @Output() zoomOut = new EventEmitter<void>();
  @Output() fitToScreen = new EventEmitter<void>();
  @Output() toggleSlotList = new EventEmitter<void>();
  @Output() refreshStatuses = new EventEmitter<void>();

  readonly legendItems: readonly ParkingStatusLegendItem[] = [
    {
      id: 'available',
      label: 'Available',
      description: 'Free',
      visualClass: 'marker-available'
    },
    {
      id: 'held',
      label: 'Held',
      description: 'Temporarily held',
      visualClass: 'marker-held'
    },
    {
      id: 'occupied',
      label: 'Occupied',
      description: 'Reserved / unavailable',
      visualClass: 'marker-occupied'
    },
    {
      id: 'selected',
      label: 'Admin Selected',
      description: 'Editing selection',
      visualClass: 'marker-selected'
    }
  ];

  get clampedZoomPercent(): number {
    const val = this.zoomPercent ?? 100;
    if (isNaN(val)) {
      return 100;
    }
    return Math.max(25, Math.min(400, Math.round(val)));
  }

  onResetView(): void {
    if (!this.disabled) {
      this.resetView.emit();
    }
  }

  onZoomIn(): void {
    if (!this.disabled) {
      this.zoomIn.emit();
    }
  }

  onZoomOut(): void {
    if (!this.disabled) {
      this.zoomOut.emit();
    }
  }

  onFitToScreen(): void {
    if (!this.disabled) {
      this.fitToScreen.emit();
    }
  }

  onToggleSlotList(): void {
    if (!this.disabled) {
      this.toggleSlotList.emit();
    }
  }

  onRefreshStatuses(): void {
    if (!this.disabled && !this.refreshing) {
      this.refreshStatuses.emit();
    }
  }
}
