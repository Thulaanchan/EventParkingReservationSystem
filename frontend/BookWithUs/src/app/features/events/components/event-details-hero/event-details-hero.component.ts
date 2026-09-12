import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges
} from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { environment } from '../../../../environments/environment';
import { EventDetails } from '../../../../core/models/events/event-details.model';

@Component({
  selector: 'app-event-details-hero',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './event-details-hero.component.html',
  styleUrl: './event-details-hero.component.css'
})
export class EventDetailsHeroComponent implements OnChanges {
  @Input({ required: true }) event!: EventDetails;

  @Output() startBooking = new EventEmitter<EventDetails>();

  imageError = false;

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

  get isPastEvent(): boolean {
    if (!this.event?.eventDate) {
      return false;
    }

    try {
      const timePart = this.event.startTime
        ? (this.event.startTime.length === 5 ? `${this.event.startTime}:00` : this.event.startTime)
        : '23:59:59';
      const eventDateTime = new Date(`${this.event.eventDate}T${timePart}`).getTime();
      return !isNaN(eventDateTime) && eventDateTime < Date.now();
    } catch {
      return false;
    }
  }

  onImageError(): void {
    this.imageError = true;
  }

  onStartBooking(): void {
    if (!this.isPastEvent && this.event) {
      this.startBooking.emit(this.event);
    }
  }
}
