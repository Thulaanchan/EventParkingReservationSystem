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
import { Subject, forkJoin, of } from 'rxjs';
import { catchError, switchMap, takeUntil } from 'rxjs/operators';
import { ParkingService } from '../../../../core/services/parking/parking.service';
import { BookingStateService } from '../../../../core/services/bookings/booking-state.service';
import { ParkingAvailability } from '../../../../core/models/parking/parking-availability.model';
import { ParkingZone } from '../../../../core/models/parking/parking-zone.model';
import { ParkingMapComponent } from '../../components/parking-map/parking-map.component';
import {
  ParkingLotLayoutService,
  VisualParkingSlot
} from '../../services/parking-lot-layout.service';

@Component({
  selector: 'app-parking-selection-page',
  standalone: true,
  imports: [CommonModule, ParkingMapComponent],
  templateUrl: './parking-selection-page.component.html',
  styleUrls: ['./parking-selection-page.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ParkingSelectionPageComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly parkingService = inject(ParkingService);
  private readonly bookingStateService = inject(BookingStateService);
  private readonly layoutService = inject(ParkingLotLayoutService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroy$ = new Subject<void>();

  eventId = 0;

  /**
   * Complete visual slot collection matching reference Image 1
   */
  visualSlots: VisualParkingSlot[] = [];

  /**
   * Code of currently selected slot (e.g. 'C13')
   */
  selectedSlotCode: string | null = 'C13';

  /**
   * Slot model of currently selected slot
   */
  selectedSlot: VisualParkingSlot | null = null;

  /**
   * Presentation metadata for event matching reference Image 1
   */
  eventTitle = 'Rockstar Aniruth Musical Show - 2026';
  eventDate = 'SEP 12, 2026 • 12:00 PM';
  venueName = 'Unicom TIC';

  /**
   * Backend availability records for checkout reservation ID mapping
   */
  backendSlots: ParkingAvailability[] = [];
  backendZones: ParkingZone[] = [];

  ngOnInit(): void {
    // 1. Initialize visual arena layout
    this.visualSlots = this.layoutService.getInitialSlots();

    // 2. Check existing booking state or use default 'C13' from Image 1
    const savedParking = this.bookingStateService.selectedParking();
    if (savedParking && savedParking.slotCode) {
      this.selectedSlotCode = savedParking.slotCode;
    } else {
      this.selectedSlotCode = 'C13';
    }
    this.selectedSlot = this.visualSlots.find(s => s.code === this.selectedSlotCode) || null;

    // 3. Inspect saved event details from BookingStateService
    const currentEvent = this.bookingStateService.selectedEvent();
    if (currentEvent) {
      if (currentEvent.eventName) {
        this.eventTitle = currentEvent.eventName;
      }
      if (currentEvent.venueName) {
        this.venueName = currentEvent.venueName;
      }
      if (currentEvent.eventDate) {
        try {
          const d = new Date(currentEvent.eventDate);
          const monthStr = d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
          const day = d.getDate();
          const year = d.getFullYear();
          const time = currentEvent.startTime || '12:00 PM';
          this.eventDate = `${monthStr} ${day}, ${year} • ${time}`;
        } catch {
          this.eventDate = currentEvent.eventDate;
        }
      }
    }

    // 4. Load backend slots and zones for backend ID resolution
    this.route.paramMap
      .pipe(
        switchMap(params => {
          const rawId =
            params.get('id') ||
            params.get('eventId') ||
            this.route.parent?.snapshot.paramMap.get('id') ||
            this.route.parent?.snapshot.paramMap.get('eventId');
          this.eventId = rawId ? parseInt(rawId, 10) : (currentEvent?.eventId || 2);

          return forkJoin({
            slots: this.parkingService.getEventParkingSlots(this.eventId).pipe(
              catchError(() => of([] as ParkingAvailability[]))
            ),
            zones: this.parkingService.getEventParkingZones(this.eventId).pipe(
              catchError(() => of([] as ParkingZone[]))
            )
          });
        }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: res => {
          this.backendSlots = res.slots || [];
          this.backendZones = res.zones || [];
          this.cdr.markForCheck();
        },
        error: () => {
          this.cdr.markForCheck();
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Slot selection handler
   */
  onVisualSlotSelect(slot: VisualParkingSlot): void {
    if (slot.status !== 'Available') {
      return;
    }

    if (this.selectedSlotCode === slot.code) {
      // Toggle off / deselect
      this.selectedSlotCode = null;
      this.selectedSlot = null;
    } else {
      this.selectedSlotCode = slot.code;
      this.selectedSlot = slot;
    }

    this.cdr.markForCheck();
  }

  /**
   * Skip parking and proceed to review
   */
  onSkipParking(): void {
    this.bookingStateService.clearParking();
    this.router.navigate(['/checkout/review']);
  }

  /**
   * Save selection and proceed to review
   */
  onContinueToReview(): void {
    if (this.selectedSlot) {
      const backendSlotId = this.layoutService.resolveBackendSlotId(
        this.selectedSlot,
        this.backendSlots
      );

      this.bookingStateService.setParking({
        parkingSlotId: backendSlotId,
        slotCode: this.selectedSlot.code,
        zoneName: this.selectedSlot.zoneName,
        fee: this.selectedSlot.fee,
        vehicleType: this.selectedSlot.vehicleType
      });
    } else {
      this.bookingStateService.clearParking();
    }

    this.router.navigate(['/checkout/review']);
  }

  /**
   * Back to seat selection
   */
  onBackToSeats(): void {
    const id = this.eventId || this.bookingStateService.selectedEvent()?.eventId || 2;
    this.router.navigate(['/events', id, 'seats']);
  }
}
