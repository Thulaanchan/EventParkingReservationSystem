import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DashboardRecommendedEvent } from '../../../../core/models/dashboards/customer-dashboard.model';

@Component({
  selector: 'app-recommended-events',
  standalone: true,
  imports: [CommonModule, RouterLink, CurrencyPipe],
  templateUrl: './recommended-events.component.html',
  styleUrl: './recommended-events.component.css'
})
export class RecommendedEventsComponent {
  @Input() events: DashboardRecommendedEvent[] = [];
  @Input() isLoading = false;
}
