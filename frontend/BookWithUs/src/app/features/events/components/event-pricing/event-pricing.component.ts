import { Component, Input } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { EventDetails } from '../../../../core/models/events/event-details.model';

@Component({
  selector: 'app-event-pricing',
  standalone: true,
  imports: [CommonModule, DecimalPipe],
  templateUrl: './event-pricing.component.html',
  styleUrl: './event-pricing.component.css'
})
export class EventPricingComponent {
  @Input({ required: true }) event!: EventDetails;
}
