import {
  ChangeDetectorRef,
  Component,
  DestroyRef,
  OnInit,
  inject
} from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { SeatService } from '../../../../../core/services/seats/seat.service';
import { EventService } from '../../../../../core/services/events/event.service';

import { EventDetails } from '../../../../../core/models/events/event-details.model';
import { EventSeatCategory } from '../../../../../core/models/seats/event-seat-category.model';
import { SeatSection } from '../../../../../core/models/seats/seat-section.model';
import { SeatAvailability } from '../../../../../core/models/seats/seat-availability.model';
import { CreateEventSeatCategoryRequest } from '../../../../../core/models/seats/create-event-seat-category-request.model';
import { CreateSeatSectionRequest } from '../../../../../core/models/seats/create-seat-section-request.model';
import { CreateSeatRequest } from '../../../../../core/models/seats/create-seat-request.model';
import { UpdateSeatRequest } from '../../../../../core/models/seats/update-seat-request.model';

@Component({
  selector: 'app-admin-seat-management-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, DecimalPipe],
  templateUrl: './admin-seat-management-page.component.html',
  styleUrl: './admin-seat-management-page.component.css'
})
export class AdminSeatManagementPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly seatService = inject(SeatService);
  private readonly eventService = inject(EventService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly cdr = inject(ChangeDetectorRef);

  eventId: number | null = null;
  event: EventDetails | null = null;

  // Real backend data
  categories: EventSeatCategory[] = [];
  sections: SeatSection[] = [];
  seats: SeatAvailability[] = [];

  // Filter & view state
  activeSectionFilter: string = 'ALL';
  activeStatusFilter: string = 'ALL';

  // State flags
  loading = true;
  loadError: string | null = null;
  actionMessage: string | null = null;
  actionError: string | null = null;
  submitting = false;

  // Selected seat for detail or edit
  selectedSeat: SeatAvailability | null = null;

  // Modal forms state
  showCategoryModal = false;
  showSectionModal = false;
  showSeatModal = false;
  showDeleteModal = false;
  seatToDelete: SeatAvailability | null = null;

  // Form models
  newCategory: CreateEventSeatCategoryRequest = {
    name: '',
    code: '',
    adultPrice: 0,
    isPubliclyBookable: true,
    displayOrder: 1
  };

  newSection: CreateSeatSectionRequest = {
    eventSeatCategoryId: 0,
    code: '',
    name: '',
    displayOrder: 1
  };

  newSeat: {
    sectionId: number;
    rowLabel: string;
    startNumber: number;
    count: number;
  } = {
    sectionId: 0,
    rowLabel: 'A',
    startNumber: 1,
    count: 10
  };

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      const parsedId = Number(idParam);
      if (!isNaN(parsedId) && parsedId > 0) {
        this.eventId = parsedId;
        this.loadSeatData();
        return;
      }
    }
    this.loading = false;
    this.loadError = 'Invalid event identifier specified.';
  }

  loadSeatData(): void {
    if (!this.eventId) return;

    this.loading = true;
    this.loadError = null;
    this.actionError = null;

    forkJoin({
      event: this.eventService.getEvent(this.eventId),
      categories: this.seatService.getEventSeatCategories(this.eventId).pipe(catchError(() => of([]))),
      sections: this.seatService.getEventSeatSections(this.eventId).pipe(catchError(() => of([]))),
      seats: this.seatService.getEventSeats(this.eventId).pipe(catchError(() => of([])))
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ event, categories, sections, seats }) => {
          this.event = event;
          this.categories = categories || [];
          this.sections = sections || [];
          this.seats = seats || [];
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

  // Filtered seats getter
  get filteredSeats(): SeatAvailability[] {
    let result = this.seats;
    if (this.activeSectionFilter !== 'ALL') {
      result = result.filter((s) => s.sectionCode === this.activeSectionFilter || s.sectionName === this.activeSectionFilter);
    }
    if (this.activeStatusFilter !== 'ALL') {
      result = result.filter((s) => s.status === this.activeStatusFilter);
    }
    return result;
  }

  // Statistics
  get totalSeatsCount(): number {
    return this.seats.length;
  }

  get availableSeatsCount(): number {
    return this.seats.filter((s) => s.status === 'Available').length;
  }

  get bookedSeatsCount(): number {
    return this.seats.filter((s) => s.status === 'Booked' || s.status === 'Held').length;
  }

  get occupancyRate(): number {
    if (this.totalSeatsCount === 0) return 0;
    return Math.round((this.bookedSeatsCount / this.totalSeatsCount) * 100);
  }

  get hasActiveBookings(): boolean {
    return (
      (this.event?.hasBookings ?? false) ||
      this.bookedSeatsCount > 0
    );
  }

  // Quick action: Generate default layout (persists via backend APIs)
  onGenerateDefaultLayout(): void {
    if (!this.eventId || this.submitting) return;

    this.submitting = true;
    this.actionError = null;
    this.actionMessage = 'Initializing standard seating layout...';

    // 1. Create standard category
    const catRequest: CreateEventSeatCategoryRequest = {
      name: 'Standard Arena',
      code: 'STD',
      adultPrice: this.event?.ticketPrice || 3500,
      isPubliclyBookable: true,
      displayOrder: 1
    };

    this.seatService.createEventSeatCategory(this.eventId, catRequest).subscribe({
      next: (createdCat) => {
        // 2. Create section
        const secRequest: CreateSeatSectionRequest = {
          eventSeatCategoryId: createdCat.id,
          code: 'SEC-A',
          name: 'Main Section A',
          displayOrder: 1
        };

        this.seatService.createSeatSection(this.eventId!, secRequest).subscribe({
          next: (createdSec) => {
            // 3. Create seats
            const seatObservables = [];
            const rows = ['A', 'B', 'C'];
            for (const row of rows) {
              for (let num = 1; num <= 8; num++) {
                const seatReq: CreateSeatRequest = {
                  seatSectionId: createdSec.id,
                  rowLabel: row,
                  number: num,
                  displayOrder: num,
                  positionX: num * 40,
                  positionY: (rows.indexOf(row) + 1) * 40
                };
                seatObservables.push(this.seatService.createSeat(this.eventId!, seatReq));
              }
            }

            forkJoin(seatObservables).subscribe({
              next: () => {
                this.submitting = false;
                this.actionMessage = 'Seating layout initialized successfully with 24 seats.';
                setTimeout(() => (this.actionMessage = null), 4000);
                this.loadSeatData();
              },
              error: () => {
                this.submitting = false;
                this.actionMessage = null;
                this.actionError = 'Section created, but failed to populate some seats.';
                this.loadSeatData();
              }
            });
          },
          error: (err: unknown) => {
            this.submitting = false;
            this.handleActionError(err, 'Failed to create seat section.');
          }
        });
      },
      error: (err: unknown) => {
        this.submitting = false;
        this.handleActionError(err, 'Failed to create seat category.');
      }
    });
  }

  // Add Category Modal
  openAddCategoryModal(): void {
    this.newCategory = {
      name: '',
      code: '',
      adultPrice: this.event?.ticketPrice || 3500,
      isPubliclyBookable: true,
      displayOrder: this.categories.length + 1
    };
    this.showCategoryModal = true;
    this.actionError = null;
  }

  onSaveCategory(): void {
    if (!this.eventId || !this.newCategory.name.trim() || !this.newCategory.code.trim()) return;

    this.submitting = true;
    this.actionError = null;

    this.seatService
      .createEventSeatCategory(this.eventId, {
        name: this.newCategory.name.trim(),
        code: this.newCategory.code.trim().toUpperCase(),
        adultPrice: Number(this.newCategory.adultPrice),
        isPubliclyBookable: this.newCategory.isPubliclyBookable,
        displayOrder: Number(this.newCategory.displayOrder)
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.submitting = false;
          this.showCategoryModal = false;
          this.actionMessage = 'Seat category created successfully.';
          setTimeout(() => (this.actionMessage = null), 3000);
          this.loadSeatData();
        },
        error: (err: unknown) => {
          this.submitting = false;
          this.handleActionError(err, 'Failed to create seat category.');
        }
      });
  }

  // Add Section Modal
  openAddSectionModal(): void {
    if (this.categories.length === 0) {
      this.actionError = 'Please create at least one seat category before adding sections.';
      return;
    }
    this.newSection = {
      eventSeatCategoryId: this.categories[0].id,
      code: '',
      name: '',
      displayOrder: this.sections.length + 1
    };
    this.showSectionModal = true;
    this.actionError = null;
  }

  onSaveSection(): void {
    if (!this.eventId || !this.newSection.code.trim() || !this.newSection.name.trim() || !this.newSection.eventSeatCategoryId) return;

    this.submitting = true;
    this.actionError = null;

    this.seatService
      .createSeatSection(this.eventId, {
        eventSeatCategoryId: Number(this.newSection.eventSeatCategoryId),
        code: this.newSection.code.trim().toUpperCase(),
        name: this.newSection.name.trim(),
        displayOrder: Number(this.newSection.displayOrder)
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.submitting = false;
          this.showSectionModal = false;
          this.actionMessage = 'Seat section created successfully.';
          setTimeout(() => (this.actionMessage = null), 3000);
          this.loadSeatData();
        },
        error: (err: unknown) => {
          this.submitting = false;
          this.handleActionError(err, 'Failed to create seat section.');
        }
      });
  }

  // Add Seats Modal
  openAddSeatModal(): void {
    if (this.sections.length === 0) {
      this.actionError = 'Please create at least one section before adding seats.';
      return;
    }
    this.newSeat = {
      sectionId: this.sections[0].id,
      rowLabel: 'A',
      startNumber: 1,
      count: 10
    };
    this.showSeatModal = true;
    this.actionError = null;
  }

  onSaveSeats(): void {
    if (!this.eventId || !this.newSeat.sectionId || !this.newSeat.rowLabel.trim() || this.newSeat.count <= 0) return;

    this.submitting = true;
    this.actionError = null;

    const observables = [];
    const row = this.newSeat.rowLabel.trim().toUpperCase();
    const start = Number(this.newSeat.startNumber);
    const count = Number(this.newSeat.count);

    for (let i = 0; i < count; i++) {
      const seatNum = start + i;
      const req: CreateSeatRequest = {
        seatSectionId: Number(this.newSeat.sectionId),
        rowLabel: row,
        number: seatNum,
        displayOrder: seatNum,
        positionX: seatNum * 35,
        positionY: 40
      };
      observables.push(this.seatService.createSeat(this.eventId, req));
    }

    forkJoin(observables)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.submitting = false;
          this.showSeatModal = false;
          this.actionMessage = `Added ${count} seat(s) in Row ${row}.`;
          setTimeout(() => (this.actionMessage = null), 3000);
          this.loadSeatData();
        },
        error: (err: unknown) => {
          this.submitting = false;
          this.handleActionError(err, 'Failed to add seats. Seat number conflict may exist.');
        }
      });
  }

  // Delete Seat
  onPromptDeleteSeat(seat: SeatAvailability, event: MouseEvent): void {
    event.stopPropagation();
    if (seat.status === 'Booked' || seat.status === 'Held') {
      this.actionError = `Cannot delete seat ${seat.seatCode} because it has an active reservation.`;
      return;
    }
    this.seatToDelete = seat;
    this.showDeleteModal = true;
    this.actionError = null;
  }

  onConfirmDeleteSeat(): void {
    if (!this.seatToDelete) return;

    this.submitting = true;
    this.actionError = null;

    this.seatService
      .deleteSeat(this.seatToDelete.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.submitting = false;
          this.showDeleteModal = false;
          this.seatToDelete = null;
          this.selectedSeat = null;
          this.actionMessage = 'Seat deleted successfully.';
          setTimeout(() => (this.actionMessage = null), 3000);
          this.loadSeatData();
        },
        error: (err: unknown) => {
          this.submitting = false;
          this.handleActionError(err, 'Failed to delete seat. Active reservations prevent deletion.');
        }
      });
  }

  onSelectSeat(seat: SeatAvailability): void {
    this.selectedSeat = this.selectedSeat?.id === seat.id ? null : seat;
  }

  private handleActionError(err: unknown, defaultMessage: string): void {
    if (err instanceof HttpErrorResponse) {
      if (err.status === 409) {
        this.actionError = err.error?.detail || err.error?.message || 'Configuration conflict. Active bookings protect this resource.';
      } else if (err.status === 400) {
        this.actionError = err.error?.detail || err.error?.message || 'Invalid seat configuration parameters provided.';
      } else if (err.error?.detail) {
        this.actionError = err.error.detail;
      } else {
        this.actionError = defaultMessage;
      }
    } else {
      this.actionError = defaultMessage;
    }
    this.cdr.markForCheck();
  }

  private handleLoadError(err: unknown): void {
    if (err instanceof HttpErrorResponse) {
      if (err.status === 404) {
        this.loadError = 'The requested event could not be found.';
      } else {
        this.loadError = 'Failed to load event seating data.';
      }
    } else {
      this.loadError = 'Failed to connect to the seats service.';
    }
  }
}
