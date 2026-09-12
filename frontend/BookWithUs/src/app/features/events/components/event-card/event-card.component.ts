import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges
} from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { environment } from '../../../../environments/environment';
import { EventSummary } from '../../../../core/models/events/event-summary.model';

@Component({
  selector: 'app-event-card',
  standalone: true,
  imports: [CommonModule, DatePipe, DecimalPipe],
  templateUrl: './event-card.component.html',
  styleUrl: './event-card.component.css'
})
export class EventCardComponent implements OnChanges {
  @Input({ required: true }) event!: EventSummary;

  @Output() viewEvent = new EventEmitter<EventSummary>();

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

  onImageError(): void {
    this.imageError = true;
  }

  onView(): void {
    if (this.event) {
      this.viewEvent.emit(this.event);
    }
  }
}
