import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { UpcomingEvent } from '../../../../../core/models/dashboards/admin-dashboard.model';

/**
 * Presentational table component for the Admin Dashboard Upcoming Events section.
 * Renders real backend metrics from UpcomingEvent matching as-01.png.
 */
@Component({
  selector: 'app-upcoming-events-table',
  standalone: true,
  imports: [CommonModule, DecimalPipe],
  templateUrl: './upcoming-events-table.component.html',
  styleUrl: './upcoming-events-table.component.css'
})
export class UpcomingEventsTableComponent {
  @Input() events: UpcomingEvent[] = [];
  @Input() loading = false;

  @Output() viewEvent = new EventEmitter<UpcomingEvent>();
  @Output() viewAll = new EventEmitter<void>();

  readonly skeletonRows = [1, 2, 3, 4];

  onViewEvent(event: UpcomingEvent): void {
    this.viewEvent.emit(event);
  }

  onViewAll(): void {
    this.viewAll.emit();
  }

  /**
   * Clamps occupancy percentage between 0 and 100 strictly for the CSS progress bar width.
   * Does NOT alter the displayed backend percentage value.
   */
  getClampedOccupancy(percentage: number | null | undefined): number {
    if (percentage == null || isNaN(percentage)) {
      return 0;
    }
    return Math.max(0, Math.min(100, Math.round(percentage)));
  }

  formatDate(dateStr: string | null | undefined): string {
    if (!dateStr) {
      return '';
    }
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) {
        return dateStr;
      }
      const month = d.toLocaleString('en-US', { month: 'short' }).toUpperCase();
      const day = String(d.getDate()).padStart(2, '0');
      const year = d.getFullYear();
      return `${month} ${day}, ${year}`;
    } catch {
      return dateStr;
    }
  }

  /**
   * Formats a raw time string (e.g. "12:00:00" or "12:00") into a clean 12-hour display.
   */
  formatTime(timeStr: string | null | undefined): string {
    if (!timeStr) {
      return '12:00 PM';
    }
    try {
      const parts = timeStr.split(':');
      if (parts.length >= 2) {
        const hours = parseInt(parts[0], 10);
        const minutes = parts[1];
        if (isNaN(hours)) {
          return timeStr;
        }
        const ampm = hours >= 12 ? 'PM' : 'AM';
        const formattedHours = hours % 12 || 12;
        return `${formattedHours}:${minutes} ${ampm}`;
      }
      return timeStr;
    } catch {
      return timeStr;
    }
  }
}
