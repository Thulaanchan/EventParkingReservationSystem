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
import { Subject, forkJoin } from 'rxjs';
import { switchMap, takeUntil } from 'rxjs/operators';
import { ParkingService } from '../../../../core/services/parking/parking.service';
import { ParkingAvailability } from '../../../../core/models/parking/parking-availability.model';
import { ParkingZone } from '../../../../core/models/parking/parking-zone.model';
import { SelectedParking } from '../../../../core/models/parking/selected-parking.model';
import { ParkingConflictResponse } from '../../../../core/models/parking/parking-conflict.model';
import {
  ParkingEventSummaryComponent,
  ParkingEventSummaryInfo
} from '../../components/parking-event-summary/parking-event-summary.component';
import { ParkingMapToolbarComponent } from '../../components/parking-map-toolbar/parking-map-toolbar.component';
import { ParkingMapComponent } from '../../components/parking-map/parking-map.component';
import { ParkingLegendComponent } from '../../components/parking-legend/parking-legend.component';
import { VehiclePriceListComponent } from '../../components/vehicle-price-list/vehicle-price-list.component';
import { SelectedParkingSummaryComponent } from '../../components/selected-parking-summary/selected-parking-summary.component';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';
import { ErrorMessageComponent } from '../../../../shared/components/error-message/error-message.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { AlertBannerComponent } from '../../../../shared/components/alert-banner/alert-banner.component';

@Component({
  selector: 'app-parking-selection-page',
  standalone: true,
  imports: [
    CommonModule,
    ParkingEventSummaryComponent,
    ParkingMapToolbarComponent,
    ParkingMapComponent,
    ParkingLegendComponent,
    VehiclePriceListComponent,
    SelectedParkingSummaryComponent,
    LoadingSpinnerComponent,
    ErrorMessageComponent,
    EmptyStateComponent,
    AlertBannerComponent
  ],
  templateUrl: './parking-selection-page.component.html',
  styleUrls: ['./parking-selection-page.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ParkingSelectionPageComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly parkingService = inject(ParkingService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroy$ = new Subject<void>();

  /**
   * Current active event ID loaded dynamically from route parameters.
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
   * Authoritative backend parking availability and zone metadata.
   */
  slots: ParkingAvailability[] = [];
  zones: ParkingZone[] = [];

  /**
   * Customer's single chosen parking slot selection in client memory.
   * At most ONE slot may be selected across the booking session.
   */
  selectedParking: SelectedParking | null = null;

  /**
   * Read-only presentation summary of the event.
   * Null if M2 Event models/service remain unintegrated stubs.
   */
  eventInfo: ParkingEventSummaryInfo | null = null;

  /**
   * Interactive map viewport scale factor.
   */
  mapZoom = 1.0;
  readonly minZoom = 0.7;
  readonly maxZoom = 1.5;
  readonly zoomStep = 0.15;

  get canZoomIn(): boolean {
    return this.mapZoom < this.maxZoom;
  }

  get canZoomOut(): boolean {
    return this.mapZoom > this.minZoom;
  }

  get canResetMap(): boolean {
    return Math.abs(this.mapZoom - 1.0) > 0.01;
  }

  get selectedParkingSlotId(): number | null {
    return this.selectedParking?.parkingSlotId ?? null;
  }

  get totalAvailableSlots(): number {
    return this.slots.filter(s => s.status === 'Available' && s.isOnlineBookable).length;
  }

  get hasParkingConfigured(): boolean {
    return this.slots.length > 0 || this.zones.length > 0;
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

          // Clear prior state when switching events
          this.eventId = nextEventId;
          this.selectedParking = null;
          this.isLoading = true;
          this.errorMessage = null;
          this.conflictMessage = null;
          this.notificationMessage = null;
          this.slots = [];
          this.zones = [];
          this.eventInfo = null;
          this.cdr.markForCheck();

          return forkJoin({
            slots: this.parkingService.getEventParkingSlots(this.eventId),
            zones: this.parkingService.getEventParkingZones(this.eventId)
          });
        }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: res => {
          this.isLoading = false;
          this.errorMessage = null;
          this.slots = res.slots || [];
          this.zones = res.zones || [];
          this.cdr.markForCheck();
        },
        error: (err: unknown) => {
          this.isLoading = false;
          this.slots = [];
          this.zones = [];
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
   * Reloads parking slots and zones for the current event.
   * Used by Retry action and 409 conflict refresh.
   */
  reloadParking(): void {
    if (!this.eventId) {
      return;
    }
    this.isLoading = true;
    this.errorMessage = null;
    this.cdr.markForCheck();

    forkJoin({
      slots: this.parkingService.getEventParkingSlots(this.eventId),
      zones: this.parkingService.getEventParkingZones(this.eventId)
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: res => {
          this.isLoading = false;
          this.slots = res.slots || [];
          this.zones = res.zones || [];
          this.reconcileSelectionWithFreshSlots();
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
   * Handles slot selection emitted from ParkingMap.
   * Single-selection only: selecting the already-selected slot toggles deselect;
   * selecting a different available slot replaces the selection.
   */
  onSlotSelect(slot: ParkingAvailability): void {
    this.conflictMessage = null;
    this.notificationMessage = null;

    // Toggle deselect if same slot clicked
    if (this.selectedParking?.parkingSlotId === slot.id) {
      this.selectedParking = null;
      this.cdr.markForCheck();
      return;
    }

    // Must be Available and online bookable
    if (slot.status !== 'Available' || !slot.isOnlineBookable) {
      return;
    }

    // Replace current selection with single new slot
    this.selectedParking = {
      parkingSlotId: slot.id,
      slotCode: slot.slotCode,
      zoneId: slot.zoneId,
      zoneName: slot.zoneName,
      vehicleType: slot.vehicleType,
      fee: slot.fee
    };

    this.cdr.markForCheck();
  }

  /**
   * Handles explicit removal of the selected parking slot.
   */
  onRemoveParking(): void {
    this.selectedParking = null;
    this.conflictMessage = null;
    this.notificationMessage = null;
    this.cdr.markForCheck();
  }

  /**
   * Handles Skip Parking action.
   * Parking is optional. Sets selectedParking = null.
   * Safely prevents navigation when M1 shared BookingStateService is unavailable,
   * preserving prior seat selection and booking progression without data loss.
   */
  onSkipParking(): void {
    this.selectedParking = null;
    this.conflictMessage = null;

    // Safety guard: Navigation toward Review requires M1 BookingStateService and Review route.
    // Because M1 BookingStateService is currently a 0-byte stub, preserve the flow locally.
    this.notificationMessage =
      'Parking skipped. Proceeding to checkout review is waiting for Member 1 BookingStateService and checkout route integration.';
    this.cdr.markForCheck();
  }

  /**
   * Handles Continue to Review action.
   * Confirms the customer's selected parking slot and prepares for Review handoff.
   */
  onContinueToReview(): void {
    if (!this.selectedParking) {
      this.notificationMessage =
        'Please select a parking slot or click "Skip Parking" to continue without parking.';
      this.cdr.markForCheck();
      return;
    }

    // Safety guard: Navigation toward Review requires M1 BookingStateService.
    this.notificationMessage = `Parking slot ${this.selectedParking.slotCode} selected. Proceeding to checkout review is waiting for Member 1 BookingStateService integration.`;
    this.cdr.markForCheck();
  }

  /**
   * Handles Back to Seats navigation.
   */
  onBackToSeats(): void {
    if (this.eventId) {
      this.router.navigate(['/events', this.eventId, 'seats']);
    }
  }

  /**
   * Reusable 409 conflict resolution handler.
   * Supports both backend conflict shapes:
   * - conflictingResourceIds: number[]
   * - conflictingParkingSlotId: number | null
   */
  handleParkingConflict(conflictPayload: unknown): void {
    const rawPayload = (conflictPayload && typeof conflictPayload === 'object' && 'error' in conflictPayload)
      ? (conflictPayload as { error: unknown }).error
      : conflictPayload;
    const payload = rawPayload && typeof rawPayload === 'object' ? (rawPayload as Partial<ParkingConflictResponse> & Record<string, unknown>) : null;
    const conflictIds: number[] = [];

    if (Array.isArray(payload?.conflictingResourceIds)) {
      conflictIds.push(...(payload.conflictingResourceIds as number[]));
    }
    if (
      payload?.conflictingParkingSlotId != null &&
      typeof payload.conflictingParkingSlotId === 'number'
    ) {
      conflictIds.push(payload.conflictingParkingSlotId);
    }

    if (
      this.selectedParking &&
      conflictIds.includes(this.selectedParking.parkingSlotId)
    ) {
      // Conflicting slot was held by another user -> clear local selection
      this.selectedParking = null;
      this.conflictMessage =
        'Your chosen parking slot was just reserved by another user. Please choose an alternative slot. The map has been refreshed.';
    } else if (this.selectedParking && conflictIds.length > 0) {
      // Different slot conflicted -> preserve current selection
      this.conflictMessage =
        'Parking availability changed for another space. Your selection was preserved. The map has been refreshed.';
    } else {
      const rawMsg = payload?.message;
      if (
        typeof rawMsg === 'string' &&
        !rawMsg.includes('Exception') &&
        !rawMsg.includes('Http')
      ) {
        this.conflictMessage = rawMsg;
      } else {
        this.conflictMessage =
          'A parking availability change occurred. The parking layout has been refreshed.';
      }
    }

    // Refresh backend data without an automatic mutation retry loop
    this.reloadParking();
  }

  /**
   * Reconciles current client selection against freshly loaded slots.
   */
  private reconcileSelectionWithFreshSlots(): void {
    if (!this.selectedParking) {
      return;
    }
    const fresh = this.slots.find(
      s => s.id === this.selectedParking?.parkingSlotId
    );
    if (!fresh || fresh.status !== 'Available' || !fresh.isOnlineBookable) {
      this.selectedParking = null;
      this.conflictMessage =
        'Your previously selected parking space is no longer available. Please select another slot.';
    }
  }

  /**
   * Safely maps HTTP errors to customer-friendly messages without exposing raw exceptions.
   */
  private mapHttpError(err: unknown): void {
    const httpErr = err && typeof err === 'object' ? (err as { status?: number }) : null;
    const status = httpErr?.status;
    if (status === 404) {
      this.errorMessage = 'Parking information is unavailable for this event.';
    } else if (status === 409) {
      this.errorMessage =
        'Parking availability has changed. Please refresh and try again.';
    } else {
      this.errorMessage =
        'Unable to load parking details right now. Please check your connection and try again.';
    }
  }

  // =========================================================================
  // MAP TOOLBAR INTEGRATION HOOKS (WORKING TRANSFORM)
  // =========================================================================

  onResetMap(): void {
    this.mapZoom = 1.0;
    this.cdr.markForCheck();
  }

  onZoomIn(): void {
    if (this.canZoomIn) {
      this.mapZoom = Math.min(this.maxZoom, Math.round((this.mapZoom + this.zoomStep) * 100) / 100);
      this.cdr.markForCheck();
    }
  }

  onZoomOut(): void {
    if (this.canZoomOut) {
      this.mapZoom = Math.max(this.minZoom, Math.round((this.mapZoom - this.zoomStep) * 100) / 100);
      this.cdr.markForCheck();
    }
  }

  onFitMap(): void {
    this.mapZoom = 1.0;
    this.cdr.markForCheck();
  }
}
