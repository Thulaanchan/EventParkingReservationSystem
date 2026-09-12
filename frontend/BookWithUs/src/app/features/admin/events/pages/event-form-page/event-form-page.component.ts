import {
  Component,
  DestroyRef,
  OnInit,
  inject
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { EventFormComponent } from '../../components/event-form/event-form.component';
import { StageLayoutOption } from '../../components/stage-layout-selector/stage-layout-selector.component';
import { EventService } from '../../../../../core/services/events/event.service';
import { VenueService } from '../../../../../core/services/venues/venue.service';
import { CategoryService } from '../../../../../core/services/categories/category.service';

import { EventDetails } from '../../../../../core/models/events/event-details.model';
import { Venue } from '../../../../../core/models/venues/venue.model';
import { EventCategory } from '../../../../../core/models/categories/event-category.model';
import { CreateEventRequest } from '../../../../../core/models/events/create-event-request.model';
import { UpdateEventRequest } from '../../../../../core/models/events/update-event-request.model';

@Component({
  selector: 'app-event-form-page',
  standalone: true,
  imports: [CommonModule, RouterLink, EventFormComponent],
  templateUrl: './event-form-page.component.html',
  styleUrl: './event-form-page.component.css'
})
export class EventFormPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly eventService = inject(EventService);
  private readonly venueService = inject(VenueService);
  private readonly categoryService = inject(CategoryService);
  private readonly destroyRef = inject(DestroyRef);

  eventId: number | null = null;
  event: EventDetails | null = null;
  venues: Venue[] = [];
  categories: EventCategory[] = [];

  readonly stageLayoutOptions: readonly StageLayoutOption[] = [
    {
      value: 'Center Stage',
      label: 'Center Stage',
      description: 'Stage positioned centrally with audience seating arranged around it.'
    }
  ];

  loading = false;
  loadError: string | null = null;

  submitting = false;
  serverError: string | null = null;

  get isEditMode(): boolean {
    return this.eventId !== null && this.eventId > 0;
  }

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam !== null && idParam !== undefined) {
      const parsedId = Number(idParam);
      if (!isNaN(parsedId) && Number.isInteger(parsedId) && parsedId > 0) {
        this.eventId = parsedId;
      } else {
        this.loadError = 'The event request is invalid.';
        return;
      }
    }
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.loadError = null;

    if (this.isEditMode && this.eventId) {
      forkJoin({
        venues: this.venueService.getVenues(),
        categories: this.categoryService.getCategories(),
        event: this.eventService.getEvent(this.eventId)
      })
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: ({ venues, categories, event }) => {
            this.venues = venues;
            this.categories = categories;
            this.event = event;
            this.loading = false;
          },
          error: (err: unknown) => {
            this.loading = false;
            this.handleLoadError(err);
          }
        });
    } else {
      forkJoin({
        venues: this.venueService.getVenues(),
        categories: this.categoryService.getCategories()
      })
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: ({ venues, categories }) => {
            this.venues = venues;
            this.categories = categories;
            this.event = null;
            this.loading = false;
          },
          error: (err: unknown) => {
            this.loading = false;
            this.handleLoadError(err);
          }
        });
    }
  }

  onSave(request: CreateEventRequest | UpdateEventRequest): void {
    if (this.submitting) {
      return;
    }

    this.submitting = true;
    this.serverError = null;

    if (this.isEditMode && this.eventId) {
      this.eventService
        .updateEvent(this.eventId, request as UpdateEventRequest)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: () => {
            this.submitting = false;
            this.router.navigate(['/admin/events']);
          },
          error: (err: unknown) => {
            this.submitting = false;
            this.handleSaveError(err);
          }
        });
    } else {
      this.eventService
        .createEvent(request as CreateEventRequest)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: () => {
            this.submitting = false;
            this.router.navigate(['/admin/events']);
          },
          error: (err: unknown) => {
            this.submitting = false;
            this.handleSaveError(err);
          }
        });
    }
  }

  onCancel(): void {
    this.router.navigate(['/admin/events']);
  }

  private handleLoadError(err: unknown): void {
    if (err instanceof HttpErrorResponse) {
      if (err.status === 400) {
        this.loadError = 'The event request is invalid.';
      } else if (err.status === 404) {
        this.loadError = 'The event could not be found.';
      } else if (err.status === 401 || err.status === 403) {
        this.loadError = 'You are not authorized to manage events.';
      } else if (err.status >= 500 || err.status === 0) {
        this.loadError = 'Event information could not be loaded. Please try again.';
      } else if (err.error?.detail && typeof err.error.detail === 'string') {
        this.loadError = err.error.detail;
      } else {
        this.loadError = 'Event information could not be loaded. Please try again.';
      }
    } else {
      this.loadError = 'Event information could not be loaded. Please try again.';
    }
  }

  private handleSaveError(err: unknown): void {
    if (err instanceof HttpErrorResponse) {
      if (err.status === 409) {
        if (err.error?.detail && typeof err.error.detail === 'string') {
          this.serverError = err.error.detail;
        } else {
          this.serverError =
            'The event could not be saved because it conflicts with the current venue schedule or existing booking restrictions. Review the event details and try again.';
        }
      } else if (err.status === 400) {
        if (err.error?.detail && typeof err.error.detail === 'string') {
          this.serverError = err.error.detail;
        } else {
          this.serverError = 'The event could not be saved. Please review the form values.';
        }
      } else if (err.status === 404) {
        this.serverError = 'The event, venue, or category could not be found.';
      } else if (err.status === 401 || err.status === 403) {
        this.serverError = 'You are not authorized to save this event.';
      } else if (err.status >= 500 || err.status === 0) {
        this.serverError = 'The event could not be saved. Please try again.';
      } else if (err.error?.detail && typeof err.error.detail === 'string') {
        this.serverError = err.error.detail;
      } else {
        this.serverError = 'The event could not be saved. Please try again.';
      }
    } else {
      this.serverError = 'The event could not be saved. Please try again.';
    }
  }
}
