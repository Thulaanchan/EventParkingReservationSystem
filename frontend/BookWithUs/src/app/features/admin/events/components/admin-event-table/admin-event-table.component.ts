import {
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  Output
} from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { EventSummary } from '../../../../../core/models/events/event-summary.model';

@Component({
  selector: 'app-admin-event-table',
  standalone: true,
  imports: [CommonModule, DecimalPipe],
  templateUrl: './admin-event-table.component.html',
  styleUrl: './admin-event-table.component.css'
})
export class AdminEventTableComponent {
  @Input() events: EventSummary[] = [];
  @Input() totalCount = 0;
  @Input() loading = false;

  @Output() viewEvent = new EventEmitter<EventSummary>();
  @Output() editEvent = new EventEmitter<EventSummary>();
  @Output() deleteEvent = new EventEmitter<EventSummary>();
  @Output() manageSeats = new EventEmitter<EventSummary>();
  @Output() manageParking = new EventEmitter<EventSummary>();
  @Output() viewBookings = new EventEmitter<EventSummary>();

  activeMenuEventId: number | null = null;

  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr.includes('T') ? dateStr : `${dateStr}T00:00:00`);
      const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
      const month = months[d.getMonth()];
      const day = String(d.getDate()).padStart(2, '0');
      const year = d.getFullYear();
      return `${month} ${day}, ${year}`;
    } catch {
      return dateStr;
    }
  }

  formatTime(timeStr: string): string {
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

  formatPrice(price: number): string {
    if (!price || price === 0) return 'Free';
    return 'LKR ' + Math.round(price).toLocaleString('en-US');
  }

  constructor(private readonly elementRef: ElementRef) {}

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.closeMenu();
    }
  }

  toggleMenu(eventId: number, event: MouseEvent): void {
    event.stopPropagation();
    if (this.activeMenuEventId === eventId) {
      this.activeMenuEventId = null;
    } else {
      this.activeMenuEventId = eventId;
    }
  }

  closeMenu(): void {
    this.activeMenuEventId = null;
  }

  onView(event: EventSummary): void {
    this.closeMenu();
    this.viewEvent.emit(event);
  }

  onEdit(event: EventSummary): void {
    this.closeMenu();
    this.editEvent.emit(event);
  }

  onDelete(event: EventSummary): void {
    if (!event.canDelete) {
      return;
    }
    this.closeMenu();
    this.deleteEvent.emit(event);
  }

  onManageSeats(event: EventSummary): void {
    this.closeMenu();
    this.manageSeats.emit(event);
  }

  onManageParking(event: EventSummary): void {
    this.closeMenu();
    this.manageParking.emit(event);
  }

  onViewBookings(event: EventSummary): void {
    this.closeMenu();
    this.viewBookings.emit(event);
  }

  isUpcoming(event: EventSummary): boolean {
    if (!event?.eventDate) {
      return true;
    }
    try {
      const timePart = event.startTime
        ? (event.startTime.length === 5 ? `${event.startTime}:00` : event.startTime)
        : '23:59:59';
      const eventDateTime = new Date(`${event.eventDate}T${timePart}`).getTime();
      return isNaN(eventDateTime) || eventDateTime >= Date.now();
    } catch {
      return true;
    }
  }
}
