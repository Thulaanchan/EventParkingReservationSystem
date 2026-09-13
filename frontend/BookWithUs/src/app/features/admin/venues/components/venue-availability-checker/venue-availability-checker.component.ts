import {
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  inject
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { VenueService } from '../../../../../core/services/venues/venue.service';
import { VenueAvailability } from '../../../../../core/models/venues/venue-availability.model';
import { VenueAvailabilityQuery } from '../../../../../core/models/venues/venue-availability-query.model';

export type AvailabilityStatus =
  | 'idle'
  | 'checking'
  | 'available'
  | 'unavailable'
  | 'error';

@Component({
  selector: 'app-venue-availability-checker',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './venue-availability-checker.component.html',
  styleUrl: './venue-availability-checker.component.css'
})
export class VenueAvailabilityCheckerComponent implements OnChanges {
  private readonly venueService = inject(VenueService);

  @Input() venueId!: number;
  @Input() excludeEventId?: number;

  date = '';
  startTime = '';
  endTime = '';

  state: AvailabilityStatus = 'idle';
  result: VenueAvailability | null = null;
  errorMessage: string | null = null;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['venueId'] || changes['excludeEventId']) {
      this.resetState();
    }
  }

  get isTimeRangeValid(): boolean {
    if (!this.startTime || !this.endTime) {
      return true;
    }
    return this.startTime < this.endTime;
  }

  get isFormValid(): boolean {
    return Boolean(
      this.date &&
      this.startTime &&
      this.endTime &&
      this.isTimeRangeValid
    );
  }

  onInputChange(): void {
    if (this.state !== 'idle') {
      this.resetState();
    }
  }

  resetState(): void {
    this.state = 'idle';
    this.result = null;
    this.errorMessage = null;
  }

  onSubmit(): void {
    if (!this.venueId || !this.isFormValid || this.state === 'checking') {
      return;
    }

    this.state = 'checking';
    this.result = null;
    this.errorMessage = null;

    const query: VenueAvailabilityQuery = {
      date: this.date,
      start: this.startTime,
      end: this.endTime
    };

    if (this.excludeEventId !== undefined && this.excludeEventId !== null) {
      query.excludeEventId = this.excludeEventId;
    }

    this.venueService.checkAvailability(this.venueId, query).subscribe({
      next: (availability: VenueAvailability) => {
        this.result = availability;
        this.state = availability.isAvailable ? 'available' : 'unavailable';
      },
      error: (err: unknown) => {
        this.state = 'error';
        this.errorMessage = this.handleError(err);
      }
    });
  }

  private handleError(err: unknown): string {
    if (err instanceof HttpErrorResponse) {
      if (err.status === 400) {
        if (typeof err.error === 'string' && err.error.trim()) {
          return err.error;
        }
        if (err.error?.message && typeof err.error.message === 'string') {
          return err.error.message;
        }
        return 'Invalid date or time range provided. Please check the inputs.';
      }
      if (err.status === 401 || err.status === 403) {
        return 'You are not authorized to check venue availability.';
      }
      if (err.status >= 500) {
        return 'Server error occurred while checking venue availability. Please try again later.';
      }
      if (err.status === 0) {
        return 'Unable to reach the server. Please check your network connection.';
      }
      if (err.error?.message && typeof err.error.message === 'string') {
        return err.error.message;
      }
    }
    return 'Failed to check venue availability. Please try again.';
  }
}
