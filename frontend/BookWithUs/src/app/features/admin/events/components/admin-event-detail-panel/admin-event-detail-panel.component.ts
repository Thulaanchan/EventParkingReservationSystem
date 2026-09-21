import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges
} from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { environment } from '../../../../../../environments/environment';
import { EventDetails } from '../../../../../core/models/events/event-details.model';

/**
 * Admin event detail drawer/panel presentational component.
 * Displays event details, capacity overview, and booking lock safeguards
 * bound strictly to backend contract properties.
 */
@Component({
  selector: 'app-admin-event-detail-panel',
  standalone: true,
  imports: [CommonModule, DatePipe, DecimalPipe],
  templateUrl: './admin-event-detail-panel.component.html',
  styleUrl: './admin-event-detail-panel.component.css'
})
export class AdminEventDetailPanelComponent implements OnChanges {
  @Input() event: EventDetails | null = null;

  @Output() closePanel = new EventEmitter<void>();
  @Output() editEvent = new EventEmitter<EventDetails>();
  @Output() manageSeats = new EventEmitter<EventDetails>();
  @Output() manageParking = new EventEmitter<EventDetails>();
  @Output() viewBookings = new EventEmitter<EventDetails>();
  @Output() deleteEvent = new EventEmitter<EventDetails>();

  imageError = false;

  formatTime(timeStr?: string | null): string {
    if (!timeStr) return '';
    if (timeStr.includes('AM') || timeStr.includes('PM')) {
      return timeStr;
    }
    const parts = timeStr.split(':');
    if (parts.length >= 2) {
      let hours = parseInt(parts[0], 10);
      const mins = parts[1];
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12 || 12;
      return `${String(hours).padStart(2, '0')}:${mins} ${ampm}`;
    }
    return timeStr;
  }

  formatPrice(price?: number | null): string {
    if (price === undefined || price === null) return '—';
    if (price === 0) return 'Free';
    return 'LKR ' + Math.round(price).toLocaleString('en-US');
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['event']) {
      this.imageError = false;
    }
  }

  get resolvedPosterUrl(): string | null {
    if (this.imageError || !this.event?.posterUrl || !this.event.posterUrl.trim()) {
      return null;
    }

    try {
      const url = this.event.posterUrl.trim();
      if (url.startsWith('http://') || url.startsWith('https://')) {
        return url;
      }
      return new URL(url, environment.apiUrl).toString();
    } catch {
      return null;
    }
  }

  onImageError(): void {
    this.imageError = true;
  }

  isUpcoming(): boolean {
    if (!this.event?.eventDate) {
      return true;
    }
    try {
      const timePart = this.event.startTime
        ? (this.event.startTime.length === 5 ? `${this.event.startTime}:00` : this.event.startTime)
        : '23:59:59';
      const eventDateTime = new Date(`${this.event.eventDate}T${timePart}`).getTime();
      return isNaN(eventDateTime) || eventDateTime >= Date.now();
    } catch {
      return true;
    }
  }

  onClose(): void {
    this.closePanel.emit();
  }

  onEdit(): void {
    if (this.event) {
      this.editEvent.emit(this.event);
    }
  }

  onManageSeats(): void {
    if (this.event) {
      this.manageSeats.emit(this.event);
    }
  }

  onManageParking(): void {
    if (this.event) {
      this.manageParking.emit(this.event);
    }
  }

  onViewBookings(): void {
    if (this.event) {
      this.viewBookings.emit(this.event);
    }
  }

  onDelete(): void {
    if (this.event && this.event.canDelete) {
      this.deleteEvent.emit(this.event);
    }
  }
}
