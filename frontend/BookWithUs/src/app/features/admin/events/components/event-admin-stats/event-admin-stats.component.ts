import { Component, Input } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-event-admin-stats',
  standalone: true,
  imports: [CommonModule, DecimalPipe],
  templateUrl: './event-admin-stats.component.html',
  styleUrl: './event-admin-stats.component.css'
})
export class EventAdminStatsComponent {
  @Input() totalEvents = 0;
  @Input() upcomingEvents = 0;
  @Input() totalBookings = 0;
}
