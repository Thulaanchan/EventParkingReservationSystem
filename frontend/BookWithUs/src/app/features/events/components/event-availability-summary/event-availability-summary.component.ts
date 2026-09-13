import { Component, Input } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { EventDetails } from '../../../../core/models/events/event-details.model';

@Component({
  selector: 'app-event-availability-summary',
  standalone: true,
  imports: [CommonModule, DecimalPipe],
  templateUrl: './event-availability-summary.component.html',
  styleUrl: './event-availability-summary.component.css'
})
export class EventAvailabilitySummaryComponent {
  @Input({ required: true }) event!: EventDetails;

  get hasConfiguredSeats(): boolean {
    return !!this.event && this.event.totalSeats > 0;
  }

  get clampedPercentage(): number {
    if (!this.hasConfiguredSeats) {
      return 0;
    }
    const pct = this.event.soldPercentage ?? 0;
    return Math.min(100, Math.max(0, Math.round(pct)));
  }
}
