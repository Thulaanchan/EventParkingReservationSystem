import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { EventService } from '../../../../core/services/events/event.service';
import { EventDetails } from '../../../../core/models/events/event-details.model';
import { EventDetailsHeroComponent } from '../../components/event-details-hero/event-details-hero.component';
import { EventInformationComponent } from '../../components/event-information/event-information.component';
import { EventPricingComponent } from '../../components/event-pricing/event-pricing.component';
import { EventAvailabilitySummaryComponent } from '../../components/event-availability-summary/event-availability-summary.component';

@Component({
  selector: 'app-event-details-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    EventDetailsHeroComponent,
    EventInformationComponent,
    EventPricingComponent,
    EventAvailabilitySummaryComponent
  ],
  templateUrl: './event-details-page.component.html',
  styleUrl: './event-details-page.component.css'
})
export class EventDetailsPageComponent implements OnInit {
  private readonly eventService = inject(EventService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  eventId: number | null = null;
  event: EventDetails | null = null;

  loading = true;
  errorMessage: string | null = null;

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (!idParam) {
      this.loading = false;
      this.errorMessage = 'No event ID was provided.';
      return;
    }

    const parsedId = Number(idParam);
    if (isNaN(parsedId) || parsedId <= 0) {
      this.loading = false;
      this.errorMessage = 'Invalid event ID provided.';
      return;
    }

    this.eventId = parsedId;
    this.loadEvent(parsedId);
  }

  loadEvent(id: number): void {
    this.loading = true;
    this.errorMessage = null;

    this.eventService.getEvent(id).subscribe({
      next: (data: EventDetails) => {
        this.event = data;
        this.loading = false;
      },
      error: (err: unknown) => {
        this.loading = false;
        this.handleLoadError(err);
      }
    });
  }

  onStartBooking(event: EventDetails): void {
    this.router.navigate(['/events', event.id, 'seats']);
  }

  onBackToEvents(): void {
    this.router.navigate(['/events']);
  }

  private handleLoadError(err: unknown): void {
    if (err instanceof HttpErrorResponse) {
      if (err.status === 404) {
        this.errorMessage = 'This event could not be found.';
      } else if (err.status === 400) {
        this.errorMessage =
          err.error?.detail && typeof err.error.detail === 'string'
            ? err.error.detail
            : 'Invalid request. Unable to find the requested event.';
      } else if (err.status >= 500 || err.status === 0) {
        this.errorMessage =
          'Unable to load event details. Please check your connection and try again.';
      } else if (err.error?.detail && typeof err.error.detail === 'string') {
        this.errorMessage = err.error.detail;
      } else {
        this.errorMessage = 'Failed to load event details. Please try again later.';
      }
    } else {
      this.errorMessage = 'Failed to load event details. Please try again later.';
    }
  }
}
