import {
  Component,
  DestroyRef,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  inject
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { VenueService } from '../../../../../../core/services/venues/venue.service';
import { VenueAvailability } from '../../../../../../core/models/venues/venue-availability.model';
import { VenueAvailabilityQuery } from '../../../../../../core/models/venues/venue-availability-query.model';

/**
 * Component to check and display real venue schedule availability.
 * Calls VenueService.checkAvailability to verify there are no overlapping events.
 */
@Component({
  selector: 'app-venue-availability-status',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './venue-availability-status.component.html',
  styleUrl: './venue-availability-status.component.css'
})
export class VenueAvailabilityStatusComponent implements OnChanges {
  private readonly venueService = inject(VenueService);
  private readonly destroyRef = inject(DestroyRef);

  @Input() venueId: number | null = null;
  @Input() date: string | null = null;
  @Input() startTime: string | null = null;
  @Input() endTime: string | null = null;
  @Input() excludeEventId?: number | null = null;
  @Input() disabled = false;

  @Output() availabilityChange = new EventEmitter<VenueAvailability | null>();

  checking = false;
  availabilityResult: VenueAvailability | null = null;
  errorMessage: string | null = null;
  validationMessage: string | null = null;

  ngOnChanges(changes: SimpleChanges): void {
    if (
      changes['venueId'] ||
      changes['date'] ||
      changes['startTime'] ||
      changes['endTime'] ||
      changes['excludeEventId']
    ) {
      if (this.availabilityResult || this.errorMessage || this.validationMessage) {
        this.clearResult();
      }
    }
  }

  get isFormComplete(): boolean {
    return (
      !!this.venueId &&
      this.venueId > 0 &&
      !!this.date &&
      !!this.date.trim() &&
      !!this.startTime &&
      !!this.startTime.trim() &&
      !!this.endTime &&
      !!this.endTime.trim()
    );
  }

  get isTimeRangeValid(): boolean {
    if (!this.startTime || !this.endTime) {
      return true;
    }
    return this.isEndTimeAfterStartTime(this.startTime.trim(), this.endTime.trim());
  }

  get canCheck(): boolean {
    return (
      !this.disabled &&
      !this.checking &&
      this.isFormComplete &&
      this.isTimeRangeValid
    );
  }

  onCheckAvailability(): void {
    if (this.disabled || this.checking) {
      return;
    }

    this.errorMessage = null;
    this.validationMessage = null;

    if (!this.venueId || this.venueId <= 0) {
      this.validationMessage = 'Select a venue first.';
      return;
    }

    if (!this.date || !this.date.trim()) {
      this.validationMessage = 'Please select an event date.';
      return;
    }

    if (!this.startTime || !this.startTime.trim() || !this.endTime || !this.endTime.trim()) {
      this.validationMessage = 'Please enter both start time and end time.';
      return;
    }

    if (!this.isEndTimeAfterStartTime(this.startTime.trim(), this.endTime.trim())) {
      this.validationMessage = 'End time must be later than start time.';
      return;
    }

    this.executeAvailabilityCheck();
  }

  private executeAvailabilityCheck(): void {
    const query: VenueAvailabilityQuery = {
      date: this.date!.trim(),
      start: this.startTime!.trim(),
      end: this.endTime!.trim()
    };

    if (this.excludeEventId !== undefined && this.excludeEventId !== null) {
      query.excludeEventId = this.excludeEventId;
    }

    this.checking = true;
    this.errorMessage = null;
    this.validationMessage = null;

    this.venueService
      .checkAvailability(this.venueId!, query)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (result: VenueAvailability) => {
          this.checking = false;
          this.availabilityResult = result;
          this.availabilityChange.emit(result);
        },
        error: (err: unknown) => {
          this.checking = false;
          this.availabilityResult = null;
          this.availabilityChange.emit(null);
          this.handleError(err);
        }
      });
  }

  private clearResult(): void {
    this.availabilityResult = null;
    this.errorMessage = null;
    this.validationMessage = null;
    this.availabilityChange.emit(null);
  }

  private isEndTimeAfterStartTime(start: string, end: string): boolean {
    try {
      const [startH, startM] = start.split(':').map(Number);
      const [endH, endM] = end.split(':').map(Number);
      if (isNaN(startH) || isNaN(startM) || isNaN(endH) || isNaN(endM)) {
        return false;
      }
      const startMinutes = startH * 60 + startM;
      const endMinutes = endH * 60 + endM;
      return endMinutes > startMinutes;
    } catch {
      return false;
    }
  }

  private handleError(err: unknown): void {
    if (err instanceof HttpErrorResponse) {
      if (err.status === 400) {
        this.errorMessage = 'Please check the selected date and time.';
      } else if (err.status === 401 || err.status === 403) {
        this.errorMessage = 'You are not authorized to check venue availability.';
      } else if (err.status === 404) {
        this.errorMessage = 'The selected venue could not be found.';
      } else if (err.status >= 500 || err.status === 0) {
        this.errorMessage = 'Venue availability could not be checked. Please try again.';
      } else if (err.error?.detail && typeof err.error.detail === 'string') {
        this.errorMessage = err.error.detail;
      } else if (err.error?.message && typeof err.error.message === 'string') {
        this.errorMessage = err.error.message;
      } else {
        this.errorMessage = 'Venue availability could not be checked. Please try again.';
      }
    } else {
      this.errorMessage = 'Venue availability could not be checked. Please try again.';
    }
  }
}
