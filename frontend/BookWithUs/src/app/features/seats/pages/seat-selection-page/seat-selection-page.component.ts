import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  inject
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { switchMap, takeUntil } from 'rxjs/operators';
import { SeatService } from '../../../../core/services/seats/seat.service';
import { EventService } from '../../../../core/services/events/event.service';
import { BookingStateService, BookingSelectedSeatInput } from '../../../../core/services/bookings/booking-state.service';
import { SeatAvailability } from '../../../../core/models/seats/seat-availability.model';
import { SeatSection } from '../../../../core/models/seats/seat-section.model';
import { EventSeatCategory } from '../../../../core/models/seats/event-seat-category.model';
import { AttendeeType, SelectedSeat } from '../../../../core/models/seats/selected-seat.model';
import { TicketRequirementsComponent } from '../../components/ticket-requirements/ticket-requirements.component';
import { SeatMapToolbarComponent } from '../../components/seat-map-toolbar/seat-map-toolbar.component';
import { SeatMapComponent } from '../../components/seat-map/seat-map.component';
import { SelectedSeatsSummaryComponent } from '../../components/selected-seats-summary/selected-seats-summary.component';
import { SeatPriceSummaryComponent } from '../../components/seat-price-summary/seat-price-summary.component';
import { SeatSectionSummaryComponent } from '../../components/seat-section-summary/seat-section-summary.component';
import { SeatLegendComponent } from '../../components/seat-legend/seat-legend.component';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';
import { ErrorMessageComponent } from '../../../../shared/components/error-message/error-message.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { AlertBannerComponent } from '../../../../shared/components/alert-banner/alert-banner.component';

@Component({
  selector: 'app-seat-selection-page',
  standalone: true,
  imports: [
    CommonModule,
    TicketRequirementsComponent,
    SeatMapToolbarComponent,
    SeatMapComponent,
    SelectedSeatsSummaryComponent,
    SeatPriceSummaryComponent,
    SeatSectionSummaryComponent,
    SeatLegendComponent,
    LoadingSpinnerComponent,
    ErrorMessageComponent,
    EmptyStateComponent,
    AlertBannerComponent
  ],
  templateUrl: './seat-selection-page.component.html',
  styleUrls: ['./seat-selection-page.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SeatSelectionPageComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly seatService = inject(SeatService);
  private readonly eventService = inject(EventService);
  private readonly bookingStateService = inject(BookingStateService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroy$ = new Subject<void>();

  /**
   * Current active event ID loaded from route parameter.
   */
  eventId = 0;

  /**
   * Mutually exclusive page states.
   */
  isLoading = true;
  errorMessage: string | null = null;
  conflictMessage: string | null = null;
  notificationMessage: string | null = null;

  /**
   * Authoritative backend seat availability data.
   */
  seats: SeatAvailability[] = [];

  /**
   * Derived sections and categories (computed from SeatAvailability to avoid 403 admin endpoint calls).
   */
  sections: SeatSection[] = [];
  categories: EventSeatCategory[] = [];
  childDiscountPercent: number | null = null;

  /**
   * Ticket requirement quantities requested by customer.
   */
  adultCount = 0;
  childCount = 0;

  /**
   * Customer selected seats in client memory.
   */
  selectedSeats: SelectedSeat[] = [];

  /**
   * Total seats requested by the customer.
   */
  get totalRequiredSeats(): number {
    return (this.adultCount || 0) + (this.childCount || 0);
  }

  /**
   * Array of IDs for O(1) matching in SeatMap.
   */
  get selectedSeatIds(): readonly number[] {
    return this.selectedSeats.map(s => s.seatId);
  }

  /**
   * Client-side display subtotal for selected seats only.
   */
  get displaySubtotal(): number {
    return this.selectedSeats.reduce((sum, s) => sum + (Number(s.price) || 0), 0);
  }

  /**
   * Interactive zoom scaling for seat map viewport.
   */
  mapZoom = 1;

  get canZoomIn(): boolean {
    return this.mapZoom < 1.8;
  }

  get canZoomOut(): boolean {
    return this.mapZoom > 0.6;
  }

  get canResetZoom(): boolean {
    return this.mapZoom !== 1;
  }

  get availableSeatsCount(): number {
    return this.seats.filter(s => s.status === 'Available' && s.isPubliclyBookable).length;
  }

  get totalSeatsCount(): number {
    return this.seats.length;
  }

  /**
   * Determines if Continue to Parking CTA is enabled.
   */
  get canContinue(): boolean {
    return (
      !this.isLoading &&
      this.totalRequiredSeats > 0 &&
      this.selectedSeats.length === this.totalRequiredSeats
    );
  }

  ngOnInit(): void {
    this.route.paramMap
      .pipe(
        switchMap(params => {
          const rawId =
            params.get('id') ||
            params.get('eventId') ||
            this.route.parent?.snapshot.paramMap.get('id') ||
            this.route.parent?.snapshot.paramMap.get('eventId');
          const nextEventId = rawId ? parseInt(rawId, 10) : 0;

          // Clear prior state when event changes
          this.eventId = nextEventId;
          this.resetCustomerSelection();
          this.isLoading = true;
          this.errorMessage = null;
          this.conflictMessage = null;
          this.notificationMessage = null;
          this.seats = [];
          this.sections = [];
          this.categories = [];
          this.cdr.markForCheck();

          return this.seatService.getEventSeats(this.eventId);
        }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: seats => {
          this.isLoading = false;
          this.errorMessage = null;
          this.seats = seats || [];
          this.processLayoutData();
          this.restoreStateFromBookingService();
          this.cdr.markForCheck();
        },
        error: (err: unknown) => {
          this.isLoading = false;
          this.seats = [];
          this.mapHttpError(err);
          this.cdr.markForCheck();
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Reloads the seats for the current event (used by Retry and 409 conflict refresh).
   */
  reloadSeats(): void {
    if (!this.eventId) {
      return;
    }
    this.isLoading = true;
    this.errorMessage = null;
    this.cdr.markForCheck();

    this.seatService.getEventSeats(this.eventId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: seats => {
          this.isLoading = false;
          this.seats = seats || [];
          this.processLayoutData();
          this.reconcileSelectionsWithFreshSeats();
          this.cdr.markForCheck();
        },
        error: (err: unknown) => {
          this.isLoading = false;
          this.mapHttpError(err);
          this.cdr.markForCheck();
        }
      });
  }

  /**
   * Processes layout metadata from SeatAvailability items directly to avoid
   * calling Administrator-only SeatLayoutController endpoints.
   */
  private processLayoutData(): void {
    const categoryMap = new Map<string, EventSeatCategory>();
    const sectionMap = new Map<string, { section: SeatSection; count: number }>();
    let catCounter = 1;
    let secCounter = 1;

    for (const seat of this.seats) {
      // Categories
      const catCode = seat.categoryCode || 'Standard';
      if (!categoryMap.has(catCode)) {
        categoryMap.set(catCode, {
          id: catCounter++,
          eventId: this.eventId,
          name: seat.categoryName || catCode,
          code: catCode,
          adultPrice: seat.adultPrice,
          childPrice: seat.childPrice,
          isPubliclyBookable: seat.isPubliclyBookable,
          displayOrder: catCounter
        });
      }

      // Sections
      const secCode = seat.sectionCode || 'General';
      if (!sectionMap.has(secCode)) {
        sectionMap.set(secCode, {
          section: {
            id: seat.sectionId || secCounter++,
            eventId: this.eventId,
            eventSeatCategoryId: 0,
            code: secCode,
            name: seat.sectionName || secCode,
            categoryName: seat.categoryName || '',
            displayOrder: secCounter,
            seatCount: 0
          },
          count: 0
        });
      }
      sectionMap.get(secCode)!.count++;
    }

    this.categories = Array.from(categoryMap.values());
    this.sections = Array.from(sectionMap.values()).map(entry => ({
      ...entry.section,
      seatCount: entry.count
    }));

    // Calculate dynamic child discount percent if available
    const firstDiscounted = this.seats.find(s => s.adultPrice > 0 && s.childPrice < s.adultPrice);
    if (firstDiscounted) {
      this.childDiscountPercent = Math.round(
        (1 - firstDiscounted.childPrice / firstDiscounted.adultPrice) * 100
      );
    } else {
      this.childDiscountPercent = null;
    }
  }

  /**
   * Handles changes in adult ticket requirement.
   */
  onAdultCountChange(count: number): void {
    this.adultCount = Math.max(0, count);
    this.notificationMessage = null;
    this.reconcileSelections();
    this.cdr.markForCheck();
  }

  /**
   * Handles changes in child ticket requirement.
   */
  onChildCountChange(count: number): void {
    this.childCount = Math.max(0, count);
    this.notificationMessage = null;
    this.reconcileSelections();
    this.cdr.markForCheck();
  }

  /**
   * Handles seat click emitted upward from SeatMap.
   */
  onSeatSelect(seat: SeatAvailability): void {
    this.conflictMessage = null;
    this.notificationMessage = null;

    // Check if already selected -> toggle deselect
    const existingIndex = this.selectedSeats.findIndex(s => s.seatId === seat.id);
    if (existingIndex >= 0) {
      this.selectedSeats = this.selectedSeats.filter(s => s.seatId !== seat.id);
      this.reconcileSelections();
      this.cdr.markForCheck();
      return;
    }

    // Must be available and publicly bookable
    if (seat.status !== 'Available' || !seat.isPubliclyBookable) {
      return;
    }

    // Must have declared ticket requirements first
    if (this.totalRequiredSeats === 0) {
      this.notificationMessage = 'Please specify how many adult or child tickets you need first.';
      this.cdr.markForCheck();
      return;
    }

    // Must not exceed declared total required seats
    if (this.selectedSeats.length >= this.totalRequiredSeats) {
      this.notificationMessage = `You have already selected all ${this.totalRequiredSeats} required seats. Increase ticket quantity or deselect a seat to choose another.`;
      this.cdr.markForCheck();
      return;
    }

    // Determine deterministic attendee assignment
    const isAdult = this.selectedSeats.length < this.adultCount;
    const attendeeType = isAdult ? AttendeeType.Adult : AttendeeType.Child;
    const price = isAdult ? seat.adultPrice : seat.childPrice;

    const newSelection: SelectedSeat = {
      seatId: seat.id,
      seatCode: seat.seatCode || `${seat.rowLabel}-${seat.number}`,
      rowLabel: seat.rowLabel,
      number: seat.number,
      sectionId: seat.sectionId,
      sectionCode: seat.sectionCode,
      sectionName: seat.sectionName,
      categoryCode: seat.categoryCode,
      categoryName: seat.categoryName,
      attendeeType,
      price
    };

    this.selectedSeats = [...this.selectedSeats, newSelection];
    this.reconcileSelections();
    this.cdr.markForCheck();
  }

  /**
   * Handles removing a single selected seat from the summary list.
   */
  onRemoveSeat(seatId: number): void {
    this.selectedSeats = this.selectedSeats.filter(s => s.seatId !== seatId);
    this.reconcileSelections();
    this.cdr.markForCheck();
  }

  /**
   * Clears all selected seats.
   */
  onClearAll(): void {
    this.selectedSeats = [];
    this.cdr.markForCheck();
  }

  /**
   * Zooms in on the seating map.
   */
  onZoomIn(): void {
    if (this.canZoomIn) {
      this.mapZoom = Number((this.mapZoom + 0.15).toFixed(2));
      this.cdr.markForCheck();
    }
  }

  /**
   * Zooms out on the seating map.
   */
  onZoomOut(): void {
    if (this.canZoomOut) {
      this.mapZoom = Number((this.mapZoom - 0.15).toFixed(2));
      this.cdr.markForCheck();
    }
  }

  /**
   * Resets map zoom back to 100%.
   */
  onResetZoom(): void {
    this.mapZoom = 1;
    this.cdr.markForCheck();
  }

  /**
   * Fits map to default viewport scale.
   */
  onFitMap(): void {
    this.mapZoom = 1;
    this.cdr.markForCheck();
  }

  /**
   * Reconciles attendee types and prices deterministically when quantities change.
   */
  private reconcileSelections(): void {
    // If ticket requirement decreased below current selection, trim excess from end
    if (this.selectedSeats.length > this.totalRequiredSeats) {
      this.selectedSeats = this.selectedSeats.slice(0, this.totalRequiredSeats);
    }

    // Deterministic attendee mapping: first adultCount -> Adult, remaining -> Child
    this.selectedSeats = this.selectedSeats.map((seat, index) => {
      const isAdult = index < this.adultCount;
      const attendeeType = isAdult ? AttendeeType.Adult : AttendeeType.Child;
      const avail = this.seats.find(s => s.id === seat.seatId);
      const price = isAdult ? (avail?.adultPrice ?? seat.price) : (avail?.childPrice ?? seat.price);
      return {
        ...seat,
        attendeeType,
        price
      };
    });
  }

  /**
   * Synchronizes selected seats after a fresh backend reload.
   */
  private reconcileSelectionsWithFreshSeats(): void {
    const validSelections: SelectedSeat[] = [];
    for (const selected of this.selectedSeats) {
      const freshSeat = this.seats.find(s => s.id === selected.seatId);
      if (freshSeat && freshSeat.status === 'Available' && freshSeat.isPubliclyBookable) {
        validSelections.push(selected);
      }
    }
    this.selectedSeats = validSelections;
    this.reconcileSelections();
  }

  /**
   * Reusable conflict handling helper supporting both backend 409 shapes
   * (conflictingResourceIds or conflictingSeatIds).
   */
  handleSeatConflict(conflictPayload: unknown): void {
    const rawPayload = (conflictPayload && typeof conflictPayload === 'object' && 'error' in conflictPayload)
      ? (conflictPayload as { error: unknown }).error
      : conflictPayload;
    const payload = rawPayload && typeof rawPayload === 'object' ? (rawPayload as Record<string, unknown>) : null;
    const conflictIds: number[] = [];
    if (Array.isArray(payload?.['conflictingResourceIds'])) {
      conflictIds.push(...(payload['conflictingResourceIds'] as number[]));
    }
    if (Array.isArray(payload?.['conflictingSeatIds'])) {
      conflictIds.push(...(payload['conflictingSeatIds'] as number[]));
    }

    if (conflictIds.length > 0) {
      // Remove only conflicting seats and preserve valid selections
      this.selectedSeats = this.selectedSeats.filter(s => !conflictIds.includes(s.seatId));
      this.reconcileSelections();
      this.conflictMessage =
        'One or more of your chosen seats were held by another user. Valid selections were preserved. The map has been updated.';
    } else {
      const rawMsg = payload?.['message'];
      if (typeof rawMsg === 'string' && !rawMsg.includes('Exception') && !rawMsg.includes('Http')) {
        this.conflictMessage = rawMsg;
      } else {
        this.conflictMessage =
          'A seat availability change occurred. The seating layout has been refreshed.';
      }
    }

    // Refresh seat availability from backend without an automatic retry mutation loop
    this.reloadSeats();
  }

  /**
   * Handles Continue to Parking navigation.
   * Stores selected seats and event info into BookingStateService and navigates to parking.
   */
  onContinueToParking(): void {
    if (!this.canContinue) {
      return;
    }

    const seatInputs: BookingSelectedSeatInput[] = this.selectedSeats.map((seat, index) => ({
      seatId: seat.seatId,
      seatCode: seat.seatCode,
      rowLabel: seat.rowLabel,
      seatNumber: seat.number,
      sectionName: seat.sectionName || seat.sectionCode || '',
      price: seat.price,
      attendeeName: (seat as any).attendeeName?.trim() || `Attendee ${index + 1}`,
      attendeeType: seat.attendeeType
    }));

    this.bookingStateService.setSeats(seatInputs);

    const currentEv = this.bookingStateService.selectedEvent();
    if (!currentEv || currentEv.eventId !== this.eventId) {
      this.eventService.getEvent(this.eventId).subscribe({
        next: (ev) => {
          this.bookingStateService.setEvent({
            eventId: ev.id,
            eventName: ev.name,
            eventDate: ev.eventDate,
            startTime: ev.startTime,
            endTime: ev.endTime,
            venueName: ev.venueName,
            categoryName: ev.categoryName,
            posterUrl: ev.posterUrl,
            description: ev.description
          });
          this.router.navigate(['/events', this.eventId, 'parking']);
        },
        error: () => {
          this.bookingStateService.setEvent({
            eventId: this.eventId,
            eventName: `Event #${this.eventId}`
          });
          this.router.navigate(['/events', this.eventId, 'parking']);
        }
      });
      return;
    }

    this.router.navigate(['/events', this.eventId, 'parking']);
  }

  private restoreStateFromBookingService(): void {
    const savedEvent = this.bookingStateService.selectedEvent();
    if (savedEvent && savedEvent.eventId === this.eventId && this.bookingStateService.hasSeatsSelected()) {
      const savedSeats = this.bookingStateService.selectedSeats();
      if (savedSeats.length > 0) {
        this.adultCount = savedSeats.filter(s => s.attendeeType === AttendeeType.Adult || (s.attendeeType as number) === 1).length;
        this.childCount = savedSeats.filter(s => s.attendeeType === AttendeeType.Child || (s.attendeeType as number) === 2).length;
        const restored: SelectedSeat[] = [];
        for (const s of savedSeats) {
          const match = this.seats.find(avail => avail.id === s.seatId);
          if (match) {
            restored.push({
              seatId: match.id,
              seatCode: match.seatCode || `${match.rowLabel}-${match.number}`,
              rowLabel: match.rowLabel,
              number: match.number,
              sectionId: match.sectionId,
              sectionCode: match.sectionCode,
              sectionName: match.sectionName,
              categoryCode: match.categoryCode,
              categoryName: match.categoryName,
              attendeeType: s.attendeeType ?? AttendeeType.Adult,
              attendeeName: s.attendeeName,
              price: s.price
            });
          }
        }
        if (restored.length > 0) {
          this.selectedSeats = restored;
        }
      }
    }
  }

  /**
   * Handles back navigation to Event details.
   */
  onBack(): void {
    this.router.navigate(['/events', this.eventId]);
  }

  /**
   * Resets local selection state when switching events.
   */
  private resetCustomerSelection(): void {
    this.adultCount = 0;
    this.childCount = 0;
    this.selectedSeats = [];
  }

  /**
   * Safely maps HTTP errors to customer-friendly messages without exposing raw exceptions.
   */
  private mapHttpError(err: unknown): void {
    const httpErr = err && typeof err === 'object' ? (err as { status?: number }) : null;
    const status = httpErr?.status;
    if (status === 404) {
      this.errorMessage = 'The seating layout for this event could not be found.';
    } else if (status === 409) {
      this.errorMessage = 'Seating availability has changed. Please refresh and select again.';
    } else {
      this.errorMessage = 'Unable to load seat availability. Please check your connection and try again.';
    }
  }
}
