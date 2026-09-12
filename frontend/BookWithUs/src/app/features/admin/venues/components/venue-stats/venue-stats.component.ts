import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-venue-stats',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './venue-stats.component.html',
  styleUrl: './venue-stats.component.css'
})
export class VenueStatsComponent {
  @Input() totalVenues = 0;
  @Input() upcomingEvents = 0;
  @Input() totalCapacity = 0;
}
