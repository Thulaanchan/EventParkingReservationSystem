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
import { EventDetails } from '../../../../core/models/events/event-details.model';
import { TicketRequirementsComponent } from '../../components/ticket-requirements/ticket-requirements.component';
import { SeatMapComponent } from '../../components/seat-map/seat-map.component';
import { ArenaLayoutService } from '../../services/arena-layout.service';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';
import { ErrorMessageComponent } from '../../../../shared/components/error-message/error-message.component';
import { AlertBannerComponent } from '../../../../shared/components/alert-banner/alert-banner.component';

export interface SectionBreakdown {
  name: string;
  rowsLabel: string;
  seatCount: number;
  categoryClass: string;
  isVip: boolean;
}

@Component({
  selector: 'app-seat-selection-page',
  standalone: true,
  imports: [
    CommonModule,
    TicketRequirementsComponent,
    SeatMapComponent,
    LoadingSpinnerComponent,
    ErrorMessageComponent,
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

  private readonly arenaLayoutService = inject(ArenaLayoutService);

  eventId = 0;
  eventDetails: EventDetails | null = null;

  isLoading = true;
  errorMessage: string | null = null;
  conflictMessage: string | null = null;
  notificationMessage: string | null = null;

  seats: SeatAvailability[] = [];
  sections: SeatSection[] = [];
  categories: EventSeatCategory[] = [];
  childDiscountPercent: number | null = 50;

  // Default to 2 Adults, 1 Child matching Image 2
  adultCount = 2;
  childCount = 1;

  selectedSeats: SelectedSeat[] = [];
  mapZoom = 1;

  // Sections Table Breakdown matching Image 2
  readonly sectionBreakdowns: SectionBreakdown[] = [
    { name: 'Platinum', rowsLabel: 'Rows AA–N', seatCount: 208, categoryClass: 'dot-platinum', isVip: false },
    { name: 'Gold', rowsLabel: 'Rows O–U', seatCount: 208, categoryClass: 'dot-gold', isVip: false },
    { name: 'Silver', rowsLabel: 'Rows V–DD', seatCount: 188, categoryClass: 'dot-silver', isVip: false },
    { name: 'VIP Pre-Reserved', rowsLabel: 'Inner Ring', seatCount: 20, categoryClass: 'dot-vip', isVip: true }
  ];

  readonly totalVenueSeats = 624;

  get totalRequiredSeats(): number {
    return (this.adultCount || 0) + (this.childCount || 0);
  }

  get selectedSeatIds(): readonly number[] {
    return this.selectedSeats.map(s => s.seatId);
  }

  get displaySubtotal(): number {
    return this.selectedSeats.reduce((sum, s) => sum + (Number(s.price) || 0), 0);
  }

  get canZoomIn(): boolean {
    return this.mapZoom < 1.6;
  }

  get canZoomOut(): boolean {
    return this.mapZoom > 0.7;
  }

  get canResetZoom(): boolean {
    return this.mapZoom !== 1;
  }

  get canContinue(): boolean {
    return (
      !this.isLoading &&
      this.adultCount > 0 &&
      this.totalRequiredSeats > 0 &&
      this.selectedSeats.length === this.totalRequiredSeats
    );
  }

  get attendeeSubtitle(): string {
    const parts: string[] = [];
    if (this.adultCount > 0) {
      parts.push(`${this.adultCount} ${this.adultCount === 1 ? 'Adult' : 'Adults'}`);
    }
    if (this.childCount > 0) {
      parts.push(`${this.childCount} ${this.childCount === 1 ? 'Child' : 'Children'}`);
    }
    return parts.length > 0 ? parts.join(', ') : 'No tickets specified';
  }

  get arenaSubtitle(): string {
    if (this.totalRequiredSeats > 0) {
      return `Select exactly ${this.totalRequiredSeats} seat${this.totalRequiredSeats === 1 ? '' : 's'} from Platinum, Gold, or Silver.`;
    }
    return 'Select your seats from Platinum, Gold, or Silver.';
  }

  get eventTitle(): string {
    return this.eventDetails?.name || 'Rockstar Aniruth Musical Show - 2026';
  }

  get eventDateFormatted(): string {
    if (this.eventDetails?.eventDate) {
      const d = new Date(this.eventDetails.eventDate);
      if (!isNaN(d.getTime())) {
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase();
      }
    }
    return 'SEP 12, 2026';
  }

  get eventTimeFormatted(): string {
    if (this.eventDetails?.startTime) {
      return this.eventDetails.startTime;
    }
    return '12:00 PM';
  }

  get eventVenueFormatted(): string {
    return this.eventDetails?.venueName || 'Unicom TIC';
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

          this.eventId = nextEventId;
          this.isLoading = true;
          this.errorMessage = null;
          this.conflictMessage = null;
          this.notificationMessage = null;
          this.cdr.markForCheck();

          // Load event metadata for top bar and sidebar header
          this.loadEventMetadata(this.eventId);

          return this.seatService.getEventSeats(this.eventId);
        }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: seats => {
          this.isLoading = false;
          this.errorMessage = null;
          this.seats = seats || [];
          const stadiumSeats = this.arenaLayoutService.generateStadiumSeats(this.seats);
          this.restoreStateFromBookingService(stadiumSeats);
          this.cdr.markForCheck();
        },
        error: () => {
          this.isLoading = false;
          this.errorMessage = null;
          this.seats = [];
          const stadiumSeats = this.arenaLayoutService.generateStadiumSeats([]);
          this.restoreStateFromBookingService(stadiumSeats);
          this.cdr.markForCheck();
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadEventMetadata(eventId: number): void {
    if (!eventId) return;

    const saved = this.bookingStateService.selectedEvent();
    if (saved && saved.eventId === eventId) {
      this.eventDetails = {
        id: saved.eventId,
        name: saved.eventName,
        eventDate: saved.eventDate || '',
        startTime: saved.startTime || '',
        endTime: saved.endTime || '',
        venueName: saved.venueName || '',
        categoryName: saved.categoryName || '',
        posterUrl: saved.posterUrl || '',
        description: saved.description || ''
      } as EventDetails;
    }

    this.eventService.getEvent(eventId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (details) => {
          this.eventDetails = details;
          if (details.childDiscountPercent) {
            this.childDiscountPercent = details.childDiscountPercent;
          }
          this.cdr.markForCheck();
        },
        error: () => {
          // Keep existing or fallback
          this.cdr.markForCheck();
        }
      });
  }

  reloadSeats(): void {
    if (!this.eventId) return;
    this.isLoading = true;
    this.errorMessage = null;
    this.cdr.markForCheck();

    this.seatService.getEventSeats(this.eventId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: seats => {
          this.isLoading = false;
          this.seats = seats || [];
          this.cdr.markForCheck();
        },
        error: (err: unknown) => {
          this.isLoading = false;
          this.mapHttpError(err);
          this.cdr.markForCheck();
        }
      });
  }

  onAdultCountChange(count: number): void {
    this.adultCount = Math.max(0, count);
    if (this.adultCount === 0 && this.childCount > 0) {
      this.childCount = 0;
      this.notificationMessage = 'Child tickets cannot be selected without at least 1 adult ticket. Children count has been reset.';
    } else {
      this.notificationMessage = null;
    }
    this.reconcileSelections();
    this.cdr.markForCheck();
  }

  onChildCountChange(count: number): void {
    if (this.adultCount === 0) {
      this.childCount = 0;
      this.notificationMessage = 'At least 1 adult ticket is required before selecting child tickets.';
      this.reconcileSelections();
      this.cdr.markForCheck();
      return;
    }
    this.childCount = Math.max(0, count);
    this.notificationMessage = null;
    this.reconcileSelections();
    this.cdr.markForCheck();
  }

  onSeatSelect(seat: SeatAvailability): void {
    this.conflictMessage = null;
    this.notificationMessage = null;

    // Toggle deselect if already selected
    const existingIndex = this.selectedSeats.findIndex(s => s.seatId === seat.id);
    if (existingIndex >= 0) {
      this.selectedSeats = this.selectedSeats.filter(s => s.seatId !== seat.id);
      this.reconcileSelections();
      this.cdr.markForCheck();
      return;
    }

    if (seat.status !== 'Available' || !seat.isPubliclyBookable) {
      return;
    }

    if (this.adultCount === 0) {
      this.notificationMessage = 'Please select at least 1 adult ticket before choosing seats.';
      this.cdr.markForCheck();
      return;
    }

    if (this.totalRequiredSeats === 0) {
      this.notificationMessage = 'Please specify your ticket requirements first.';
      this.cdr.markForCheck();
      return;
    }

    if (this.selectedSeats.length >= this.totalRequiredSeats) {
      this.notificationMessage = `You have already selected all ${this.totalRequiredSeats} required seats. Increase ticket quantity or deselect a seat to choose another.`;
      this.cdr.markForCheck();
      return;
    }

    // Determine attendee type and pricing
    const isAdult = this.selectedSeats.length < this.adultCount;
    const attendeeType = isAdult ? AttendeeType.Adult : AttendeeType.Child;
    const basePrice = this.getBasePrice(seat.categoryCode, seat.adultPrice);
    const discount = this.childDiscountPercent ?? 50;
    const price = isAdult ? basePrice : Math.round(basePrice * (100 - discount) / 100);

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

  onRemoveSeat(seatId: number): void {
    this.selectedSeats = this.selectedSeats.filter(s => s.seatId !== seatId);
    this.reconcileSelections();
    this.cdr.markForCheck();
  }

  onClearAll(): void {
    this.selectedSeats = [];
    this.cdr.markForCheck();
  }

  onZoomIn(): void {
    if (this.canZoomIn) {
      this.mapZoom = Number((this.mapZoom + 0.15).toFixed(2));
      this.cdr.markForCheck();
    }
  }

  onZoomOut(): void {
    if (this.canZoomOut) {
      this.mapZoom = Number((this.mapZoom - 0.15).toFixed(2));
      this.cdr.markForCheck();
    }
  }

  onResetZoom(): void {
    this.mapZoom = 1;
    this.cdr.markForCheck();
  }

  onFitMap(): void {
    this.mapZoom = 1;
    this.cdr.markForCheck();
  }

  getBasePrice(categoryCode?: string, fallbackPrice?: number): number {
    const code = (categoryCode || '').toUpperCase();
    if (code.includes('PLAT') || code === 'P') return 15000;
    if (code.includes('GOLD') || code === 'G') return 12500;
    if (code.includes('SILV') || code === 'S') return 10000;
    if (code.includes('VIP')) return 25000;
    return fallbackPrice || 15000;
  }

  private reconcileSelections(): void {
    if (this.selectedSeats.length > this.totalRequiredSeats) {
      this.selectedSeats = this.selectedSeats.slice(0, this.totalRequiredSeats);
    }

    const discount = this.childDiscountPercent ?? 50;
    this.selectedSeats = this.selectedSeats.map((seat, index) => {
      const isAdult = index < this.adultCount;
      const attendeeType = isAdult ? AttendeeType.Adult : AttendeeType.Child;
      const basePrice = this.getBasePrice(seat.categoryCode, seat.price);
      const price = isAdult ? basePrice : Math.round(basePrice * (100 - discount) / 100);
      return {
        ...seat,
        attendeeType,
        price
      };
    });
  }

  onContinueToParking(): void {
    if (!this.canContinue) {
      return;
    }

    const availablePool = [...(this.seats || []).filter(s => s.status === 'Available' && s.isPubliclyBookable)];
    const assignedIds = new Set<number>();

    const seatInputs: BookingSelectedSeatInput[] = this.selectedSeats.map((seat, index) => {
      let resolvedSeatId = seat.seatId;
      const backendMatch = (this.seats || []).find(s => s.id === seat.seatId && s.status === 'Available');

      if (!backendMatch || assignedIds.has(resolvedSeatId)) {
        const cat = (seat.categoryCode || seat.categoryName || '').toUpperCase();
        const replacement = availablePool.find(s =>
          !assignedIds.has(s.id) &&
          ((s.categoryCode && s.categoryCode.toUpperCase() === cat) ||
           (s.categoryName && s.categoryName.toUpperCase().includes(cat)))
        ) || availablePool.find(s => !assignedIds.has(s.id));

        if (replacement) {
          resolvedSeatId = replacement.id;
        }
      }

      assignedIds.add(resolvedSeatId);

      return {
        seatId: resolvedSeatId,
        seatCode: seat.seatCode,
        rowLabel: seat.rowLabel,
        seatNumber: seat.number,
        sectionName: seat.sectionName || seat.sectionCode || '',
        price: seat.price,
        attendeeName: (seat as any).attendeeName?.trim() || `Attendee ${index + 1}`,
        attendeeType: seat.attendeeType
      };
    });

    this.bookingStateService.setSeats(seatInputs);

    if (this.eventDetails) {
      this.bookingStateService.setEvent({
        eventId: this.eventDetails.id,
        eventName: this.eventDetails.name,
        eventDate: this.eventDetails.eventDate,
        startTime: this.eventDetails.startTime,
        endTime: this.eventDetails.endTime,
        venueName: this.eventDetails.venueName,
        categoryName: this.eventDetails.categoryName,
        posterUrl: this.eventDetails.posterUrl,
        description: this.eventDetails.description
      });
    }

    this.router.navigate(['/events', this.eventId, 'parking']);
  }

  private initDefaultDemoSeats(stadiumSeats: SeatAvailability[]): void {
    if (this.selectedSeats.length > 0) return;

    const pBackend = (this.seats || []).find(s => s.status === 'Available' && (s.categoryCode === 'P' || s.categoryName === 'Platinum'));
    const gBackend = (this.seats || []).find(s => s.status === 'Available' && (s.categoryCode === 'G' || s.categoryName === 'Gold'));
    const sBackend = (this.seats || []).find(s => s.status === 'Available' && (s.categoryCode === 'S' || s.categoryName === 'Silver'));

    const pSeat = stadiumSeats.find(s => s.seatCode === 'P-N-03') || stadiumSeats.find(s => s.categoryCode === 'P');
    const gSeat = stadiumSeats.find(s => s.seatCode === 'G-E-05') || stadiumSeats.find(s => s.categoryCode === 'G');
    const sSeat = stadiumSeats.find(s => s.seatCode === 'S-I-06') || stadiumSeats.find(s => s.categoryCode === 'S');

    const demoSelections: SelectedSeat[] = [];

    if (pSeat) {
      demoSelections.push({
        seatId: pBackend?.id ?? pSeat.id,
        seatCode: pSeat.seatCode || 'P-N-03',
        rowLabel: pSeat.rowLabel,
        number: pSeat.number,
        sectionId: pSeat.sectionId,
        sectionCode: pSeat.sectionCode,
        sectionName: pSeat.sectionName,
        categoryCode: pSeat.categoryCode,
        categoryName: pSeat.categoryName,
        attendeeType: AttendeeType.Adult,
        price: 15000
      });
    }

    if (gSeat) {
      demoSelections.push({
        seatId: gBackend?.id ?? gSeat.id,
        seatCode: gSeat.seatCode || 'G-E-05',
        rowLabel: gSeat.rowLabel,
        number: gSeat.number,
        sectionId: gSeat.sectionId,
        sectionCode: gSeat.sectionCode,
        sectionName: gSeat.sectionName,
        categoryCode: gSeat.categoryCode,
        categoryName: gSeat.categoryName,
        attendeeType: AttendeeType.Adult,
        price: 12500
      });
    }

    if (sSeat) {
      demoSelections.push({
        seatId: sBackend?.id ?? sSeat.id,
        seatCode: sSeat.seatCode || 'S-I-06',
        rowLabel: sSeat.rowLabel,
        number: sSeat.number,
        sectionId: sSeat.sectionId,
        sectionCode: sSeat.sectionCode,
        sectionName: sSeat.sectionName,
        categoryCode: sSeat.categoryCode,
        categoryName: sSeat.categoryName,
        attendeeType: AttendeeType.Child,
        price: 5000
      });
    }

    if (demoSelections.length === 3) {
      this.selectedSeats = demoSelections;
    }
  }

  private restoreStateFromBookingService(stadiumSeats?: SeatAvailability[]): void {
    const savedEvent = this.bookingStateService.selectedEvent();
    if (savedEvent && savedEvent.eventId === this.eventId && this.bookingStateService.hasSeatsSelected()) {
      const savedSeats = this.bookingStateService.selectedSeats();
      if (savedSeats.length > 0) {
        this.adultCount = savedSeats.filter(s => s.attendeeType === AttendeeType.Adult || (s.attendeeType as number) === 1).length;
        this.childCount = savedSeats.filter(s => s.attendeeType === AttendeeType.Child || (s.attendeeType as number) === 2).length;
        if (this.adultCount === 0 && this.childCount > 0) {
          this.childCount = 0;
        }
        this.selectedSeats = savedSeats.map(s => ({
          seatId: s.seatId,
          seatCode: s.seatCode,
          rowLabel: s.rowLabel,
          number: s.seatNumber,
          sectionId: 1,
          sectionCode: '',
          sectionName: s.sectionName,
          categoryCode: s.seatCode.startsWith('P') ? 'P' : (s.seatCode.startsWith('G') ? 'G' : 'S'),
          categoryName: s.seatCode.startsWith('P') ? 'Platinum' : (s.seatCode.startsWith('G') ? 'Gold' : 'Silver'),
          attendeeType: s.attendeeType,
          price: s.price
        }));
        return;
      }
    }

    if (stadiumSeats && stadiumSeats.length > 0) {
      this.initDefaultDemoSeats(stadiumSeats);
    }
  }

  onBack(): void {
    this.router.navigate(['/events', this.eventId]);
  }

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

  getCategoryColor(cat: string): string {
    const lower = (cat || '').toLowerCase();
    if (lower.includes('plat') || lower === 'p') return '#6366f1';
    if (lower.includes('gold') || lower === 'g') return '#f59e0b';
    if (lower.includes('silv') || lower === 's') return '#94a3b8';
    if (lower.includes('vip')) return '#0f172a';
    return '#6366f1';
  }
}
