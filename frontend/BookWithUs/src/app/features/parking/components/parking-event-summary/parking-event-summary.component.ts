import {
  ChangeDetectionStrategy,
  Component,
  Input
} from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';

/**
 * Minimal, truthful presentation interface for event summary data.
 * Accommodates M2 Event integration without inventing a competing global domain model.
 */
export interface ParkingEventSummaryInfo {
  id?: number;
  title?: string;
  name?: string;
  venue?: string;
  venueName?: string;
  date?: string | Date;
  eventDate?: string | Date;
  time?: string;
  category?: string;
  categoryName?: string;
  imageUrl?: string;
  posterUrl?: string;
}

@Component({
  selector: 'app-parking-event-summary',
  standalone: true,
  imports: [CommonModule],
  providers: [DatePipe],
  templateUrl: './parking-event-summary.component.html',
  styleUrls: ['./parking-event-summary.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ParkingEventSummaryComponent {
  /**
   * Event summary data passed down from parent page / state.
   */
  @Input() event: ParkingEventSummaryInfo | null = null;

  constructor(private datePipe: DatePipe) {}

  get hasEvent(): boolean {
    return !!(this.event && (this.eventTitle || this.venueDisplay));
  }

  get eventTitle(): string {
    return this.event?.title || this.event?.name || '';
  }

  get venueDisplay(): string {
    return this.event?.venueName || this.event?.venue || '';
  }

  get categoryDisplay(): string {
    return this.event?.categoryName || this.event?.category || '';
  }

  get dateDisplay(): string {
    const rawDate = this.event?.eventDate || this.event?.date;
    if (!rawDate) {
      return '';
    }
    if (rawDate instanceof Date) {
      return this.datePipe.transform(rawDate, 'fullDate') || rawDate.toDateString();
    }
    const parsed = new Date(rawDate);
    if (!isNaN(parsed.getTime())) {
      return this.datePipe.transform(parsed, 'fullDate') || rawDate;
    }
    return rawDate;
  }

  get timeDisplay(): string {
    return this.event?.time || '';
  }
}
