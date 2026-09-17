import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DashboardUpcomingBooking } from '../../../../core/models/dashboards/customer-dashboard.model';

@Component({
  selector: 'app-upcoming-booking-card',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './upcoming-booking-card.component.html',
  styleUrl: './upcoming-booking-card.component.css'
})
export class UpcomingBookingCardComponent {
  @Input() count = 0;
  @Input() booking: DashboardUpcomingBooking | null = null;
  @Input() isLoading = false;
}
