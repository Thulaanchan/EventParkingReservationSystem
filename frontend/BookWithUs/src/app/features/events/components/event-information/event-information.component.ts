import { Component, Input } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { EventDetails } from '../../../../core/models/events/event-details.model';

@Component({
  selector: 'app-event-information',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './event-information.component.html',
  styleUrl: './event-information.component.css'
})
export class EventInformationComponent {
  @Input({ required: true }) event!: EventDetails;
}
