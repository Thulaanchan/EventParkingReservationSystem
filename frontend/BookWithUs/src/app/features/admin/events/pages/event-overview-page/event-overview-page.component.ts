import {
  ChangeDetectorRef,
  Component,
  DestroyRef,
  OnInit,
  inject
} from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { EventService } from '../../../../../core/services/events/event.service';
import { ParkingService } from '../../../../../core/services/parking/parking.service';
import { SeatService } from '../../../../../core/services/seats/seat.service';
import { BookingService } from '../../../../../core/services/bookings/booking.service';

import { EventDetails } from '../../../../../core/models/events/event-details.model';
import { ParkingZone } from '../../../../../core/models/parking/parking-zone.model';
import { ParkingAvailability } from '../../../../../core/models/parking/parking-availability.model';
import { SeatAvailability } from '../../../../../core/models/seats/seat-availability.model';
import { BookingSummary } from '../../../../../core/models/bookings/booking-summary.model';
import { environment } from '../../../../../../environments/environment';

@Component({
  selector: 'app-event-overview-page',
  standalone: true,
  imports: [CommonModule, RouterLink, DatePipe, DecimalPipe],
  templateUrl: './event-overview-page.component.html',
  styleUrl: './event-overview-page.component.css'
})
export class EventOverviewPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly eventService = inject(EventService);
  private readonly parkingService = inject(ParkingService);
  private readonly seatService = inject(SeatService);
  private readonly bookingService = inject(BookingService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly cdr = inject(ChangeDetectorRef);

  eventId: number | null = null;
  event: EventDetails | null = null;

  // Additional stats
  parkingZones: ParkingZone[] = [];
  parkingSlots: ParkingAvailability[] = [];
  seats: SeatAvailability[] = [];
  bookings: BookingSummary[] = [];

  loading = true;
  loadError: string | null = null;
  imageError = false;

  // Delete modal state
  showDeleteModal = false;
  deleting = false;
  deleteError: string | null = null;

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      const parsedId = Number(idParam);
      if (!isNaN(parsedId) && parsedId > 0) {
        this.eventId = parsedId;
        this.loadEventOverview();
        return;
      }
    }
    this.loading = false;
    this.loadError = 'Invalid event identifier specified.';
  }

  loadEventOverview(): void {
    if (!this.eventId) return;

    this.loading = true;
    this.loadError = null;

    forkJoin({
      event: this.eventService.getEvent(this.eventId),
      parkingZones: this.parkingService.getEventParkingZones(this.eventId).pipe(catchError(() => of([]))),
      parkingSlots: this.parkingService.getEventParkingSlots(this.eventId).pipe(catchError(() => of([]))),
      seats: this.seatService.getEventSeats(this.eventId).pipe(catchError(() => of([]))),
      bookings: this.bookingService.getEventBookings(this.eventId).pipe(catchError(() => of([])))
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ event, parkingZones, parkingSlots, seats, bookings }) => {
          this.event = event;
          this.parkingZones = parkingZones;
          this.parkingSlots = parkingSlots;
          this.seats = seats;
          this.bookings = bookings;
          this.loading = false;
          this.cdr.markForCheck();
        },
        error: (err: unknown) => {
          this.loading = false;
          this.handleLoadError(err);
          this.cdr.markForCheck();
        }
      });
  }

  // Computed / formatted getters
  get resolvedPosterUrl(): string | null {
    if (this.imageError || !this.event?.posterUrl || !this.event.posterUrl.trim()) {
      return null;
    }
    try {
      const url = this.event.posterUrl.trim();
      if (url.startsWith('http://') || url.startsWith('https://')) {
        return url;
      }
      return new URL(url, environment.apiUrl).toString();
    } catch {
      return null;
    }
  }

  onImageError(): void {
    this.imageError = true;
  }

  isUpcoming(): boolean {
    if (!this.event?.eventDate) return true;
    try {
      const timePart = this.event.startTime
        ? (this.event.startTime.length === 5 ? `${this.event.startTime}:00` : this.event.startTime)
        : '23:59:59';
      const eventDateTime = new Date(`${this.event.eventDate}T${timePart}`).getTime();
      return isNaN(eventDateTime) || eventDateTime >= Date.now();
    } catch {
      return true;
    }
  }

  formatTime(timeStr?: string | null): string {
    if (!timeStr) return '—';
    if (timeStr.includes('AM') || timeStr.includes('PM')) {
      return timeStr;
    }
    const parts = timeStr.split(':');
    if (parts.length >= 2) {
      let hours = parseInt(parts[0], 10);
      const mins = parts[1];
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12 || 12;
      return `${String(hours).padStart(2, '0')}:${mins} ${ampm}`;
    }
    return timeStr;
  }

  formatPrice(price?: number | null): string {
    if (price === undefined || price === null) return '—';
    if (price === 0) return 'Free';
    return 'LKR ' + Math.round(price).toLocaleString('en-US');
  }

  // Seat stats
  get totalSeats(): number {
    if (this.seats.length > 0) return this.seats.length;
    return this.event?.totalSeats || this.event?.capacity || 0;
  }

  get availableSeats(): number {
    if (this.seats.length > 0) {
      return this.seats.filter((s) => s.status === 'Available').length;
    }
    return this.event?.availableSeats || (this.totalSeats - this.bookedSeats);
  }

  get bookedSeats(): number {
    if (this.seats.length > 0) {
      return this.seats.filter((s) => s.status === 'Booked' || s.status === 'Held').length;
    }
    return this.event?.bookedSeats || this.event?.bookingCount || 0;
  }

  get occupancyPercentage(): number {
    if (this.totalSeats === 0) return 0;
    return Math.round((this.bookedSeats / this.totalSeats) * 100);
  }

  // Parking stats
  get totalParkingSlots(): number {
    if (this.parkingSlots.length > 0) return this.parkingSlots.length;
    return this.parkingZones.reduce((acc, z) => acc + (z.slotCount || 0), 0);
  }

  get availableParkingSlots(): number {
    if (this.parkingSlots.length > 0) {
      return this.parkingSlots.filter((p) => p.status === 'Available').length;
    }
    return this.totalParkingSlots;
  }

  get reservedParkingSlots(): number {
    if (this.parkingSlots.length > 0) {
      return this.parkingSlots.filter((p) => p.status === 'Occupied' || p.status === 'Held').length;
    }
    return 0;
  }

  get bookingCount(): number {
    if (this.bookings.length > 0) return this.bookings.length;
    return this.event?.bookingCount || 0;
  }

  get hasActiveBookings(): boolean {
    return (
      (this.event?.hasBookings ?? false) ||
      this.bookedSeats > 0 ||
      this.bookingCount > 0
    );
  }

  get canDeleteEvent(): boolean {
    return !this.hasActiveBookings && (this.event?.canDelete ?? true);
  }

  // Actions
  onEdit(): void {
    if (this.eventId) {
      this.router.navigate(['/admin/events', this.eventId, 'edit']);
    }
  }

  onManageSeats(): void {
    if (this.eventId) {
      this.router.navigate(['/admin/events', this.eventId, 'seats']);
    }
  }

  onManageParking(): void {
    if (this.eventId) {
      this.router.navigate(['/admin/events', this.eventId, 'parking']);
    }
  }

  onViewBookings(): void {
    if (this.eventId) {
      this.router.navigate(['/admin/bookings'], { queryParams: { eventId: this.eventId } });
    }
  }

  onPromptDelete(): void {
    if (!this.canDeleteEvent) return;
    this.showDeleteModal = true;
    this.deleteError = null;
  }

  onCancelDelete(): void {
    if (this.deleting) return;
    this.showDeleteModal = false;
    this.deleteError = null;
  }

  onConfirmDelete(): void {
    if (!this.eventId || this.deleting) return;

    this.deleting = true;
    this.deleteError = null;

    this.eventService
      .deleteEvent(this.eventId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.deleting = false;
          this.showDeleteModal = false;
          this.router.navigate(['/admin/events']);
        },
        error: (err: unknown) => {
          this.deleting = false;
          if (err instanceof HttpErrorResponse) {
            if (err.status === 409) {
              this.deleteError = 'This event cannot be deleted because active bookings exist.';
            } else if (err.error?.detail) {
              this.deleteError = err.error.detail;
            } else {
              this.deleteError = 'Failed to delete event. Please try again.';
            }
          } else {
            this.deleteError = 'Failed to delete event. Please try again.';
          }
          this.cdr.markForCheck();
        }
      });
  }

  private handleLoadError(err: unknown): void {
    if (err instanceof HttpErrorResponse) {
      if (err.status === 404) {
        this.loadError = 'The requested event could not be found.';
      } else if (err.status === 401 || err.status === 403) {
        this.loadError = 'You do not have permission to view this event.';
      } else {
        this.loadError = 'Unable to load event details. Please try again later.';
      }
    } else {
      this.loadError = 'Unable to load event details. Please check your network connection.';
    }
  }
}
