import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { VenueService } from '../../../../../core/services/venues/venue.service';
import { Venue } from '../../../../../core/models/venues/venue.model';
import { CreateVenueRequest } from '../../../../../core/models/venues/create-venue-request.model';
import { UpdateVenueRequest } from '../../../../../core/models/venues/update-venue-request.model';
import { VenueFormComponent } from '../../components/venue-form/venue-form.component';

@Component({
  selector: 'app-venue-form-page',
  standalone: true,
  imports: [CommonModule, RouterLink, VenueFormComponent],
  templateUrl: './venue-form-page.component.html',
  styleUrl: './venue-form-page.component.css'
})
export class VenueFormPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly venueService = inject(VenueService);

  venueId: number | null = null;
  venue: Venue | null = null;

  loading = false;
  loadError: string | null = null;

  submitting = false;
  submitError: string | null = null;

  get isEditMode(): boolean {
    return this.venueId !== null && this.venueId > 0;
  }

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      const parsedId = Number(idParam);
      if (!isNaN(parsedId) && parsedId > 0) {
        this.venueId = parsedId;
        this.loadVenue(parsedId);
      } else {
        this.loadError = 'Invalid venue ID provided.';
      }
    }
  }

  loadVenue(id: number): void {
    this.loading = true;
    this.loadError = null;

    this.venueService.getVenue(id).subscribe({
      next: (data: Venue) => {
        this.venue = data;
        this.loading = false;
      },
      error: (err: unknown) => {
        this.loading = false;
        if (err instanceof HttpErrorResponse) {
          if (err.status === 404) {
            this.loadError = 'The requested venue could not be found.';
          } else if (err.status >= 500 || err.status === 0) {
            this.loadError =
              'Unable to load venue details. Please check your connection and try again.';
          } else if (err.error?.detail && typeof err.error.detail === 'string') {
            this.loadError = err.error.detail;
          } else {
            this.loadError = 'Failed to load venue details. Please try again.';
          }
        } else {
          this.loadError = 'Failed to load venue details. Please try again.';
        }
      }
    });
  }

  onSave(request: CreateVenueRequest | UpdateVenueRequest): void {
    if (this.submitting) {
      return;
    }

    this.submitting = true;
    this.submitError = null;

    if (this.isEditMode && this.venueId) {
      this.venueService.updateVenue(this.venueId, request as UpdateVenueRequest).subscribe({
        next: () => {
          this.submitting = false;
          this.router.navigate(['/admin/venues']);
        },
        error: (err: unknown) => {
          this.submitting = false;
          this.handleSubmitError(err, 'update');
        }
      });
    } else {
      this.venueService.createVenue(request as CreateVenueRequest).subscribe({
        next: () => {
          this.submitting = false;
          this.router.navigate(['/admin/venues']);
        },
        error: (err: unknown) => {
          this.submitting = false;
          this.handleSubmitError(err, 'create');
        }
      });
    }
  }

  onCancel(): void {
    this.router.navigate(['/admin/venues']);
  }

  private handleSubmitError(err: unknown, action: 'create' | 'update'): void {
    if (!(err instanceof HttpErrorResponse)) {
      this.submitError = `An unexpected error occurred while ${action === 'create' ? 'creating' : 'updating'} the venue. Please try again.`;
      return;
    }

    if (err.status === 409) {
      this.submitError =
        action === 'create'
          ? 'A venue with this name already exists. Please choose a different name.'
          : 'Another venue already uses this name. Please choose a different name.';
    } else if (err.status === 400) {
      this.submitError =
        (err.error?.detail && typeof err.error.detail === 'string')
          ? err.error.detail
          : 'Invalid venue data. Please check your inputs and try again.';
    } else if (err.status === 404 && action === 'update') {
      this.submitError = 'Venue was not found and could not be updated.';
    } else if (err.status >= 500 || err.status === 0) {
      this.submitError = `Server or network error occurred while ${action === 'create' ? 'creating' : 'updating'} the venue. Please try again.`;
    } else if (err.error?.detail && typeof err.error.detail === 'string') {
      this.submitError = err.error.detail;
    } else {
      this.submitError = `An unexpected error occurred while ${action === 'create' ? 'creating' : 'updating'} the venue. Please try again.`;
    }
  }
}
