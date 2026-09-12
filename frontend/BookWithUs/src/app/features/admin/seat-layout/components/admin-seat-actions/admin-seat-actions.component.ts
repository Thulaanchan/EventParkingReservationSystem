import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Presentational toolbar and action component for the Admin Seat Map canvas.
 * Exposes view/navigation/refresh actions upward matching ad s 06 m.png.
 * Completely dependency-free from incomplete M3 domain models and services.
 */
@Component({
  selector: 'app-admin-seat-actions',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-seat-actions.component.html',
  styleUrl: './admin-seat-actions.component.css'
})
export class AdminSeatActionsComponent {
  @Input() refreshing = false;
  @Input() seatListOpen = false;
  @Input() zoomPercent = 100;
  @Input() disabled = false;

  @Output() resetView = new EventEmitter<void>();
  @Output() zoomIn = new EventEmitter<void>();
  @Output() zoomOut = new EventEmitter<void>();
  @Output() fitToScreen = new EventEmitter<void>();
  @Output() toggleSeatList = new EventEmitter<void>();
  @Output() refreshStatuses = new EventEmitter<void>();

  /**
   * Clamps displayed zoom value between 0% and 999% for safe display.
   */
  get clampedZoomPercent(): number {
    const val = this.zoomPercent ?? 100;
    if (isNaN(val)) {
      return 100;
    }
    return Math.max(0, Math.min(999, Math.round(val)));
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

  onToggleSeatList(): void {
    if (!this.disabled) {
      this.toggleSeatList.emit();
    }
  }

  onRefreshStatuses(): void {
    if (!this.disabled && !this.refreshing) {
      this.refreshStatuses.emit();
    }
  }
}
