import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EventSummary } from '../../../../core/models/events/event-summary.model';
import { EventCardComponent } from '../event-card/event-card.component';

@Component({
  selector: 'app-event-card-list',
  standalone: true,
  imports: [CommonModule, EventCardComponent],
  templateUrl: './event-card-list.component.html',
  styleUrl: './event-card-list.component.css'
})
export class EventCardListComponent {
  @Input() events: EventSummary[] = [];
  @Input() loading = false;

  @Output() viewEvent = new EventEmitter<EventSummary>();

  onViewEvent(event: EventSummary): void {
    this.viewEvent.emit(event);
  }
}
