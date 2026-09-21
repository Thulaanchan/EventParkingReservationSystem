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

import { ParkingService } from '../../../../../core/services/parking/parking.service';
import { EventService } from '../../../../../core/services/events/event.service';

import { EventDetails } from '../../../../../core/models/events/event-details.model';
import { ParkingZone } from '../../../../../core/models/parking/parking-zone.model';
import { ParkingAvailability } from '../../../../../core/models/parking/parking-availability.model';
import { VehicleType, VehicleTypeName } from '../../../../../core/models/parking/vehicle-type.model';
import { CreateParkingZoneRequest } from '../../../../../core/models/parking/create-parking-zone-request.model';
import { UpdateParkingZoneRequest } from '../../../../../core/models/parking/update-parking-zone-request.model';
import { CreateParkingSlotRequest } from '../../../../../core/models/parking/create-parking-slot-request.model';
import { UpdateParkingSlotRequest } from '../../../../../core/models/parking/update-parking-slot-request.model';

@Component({
  selector: 'app-admin-parking-management-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, DecimalPipe],
  templateUrl: './admin-parking-management-page.component.html',
  styleUrl: './admin-parking-management-page.component.css'
})
export class AdminParkingManagementPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly parkingService = inject(ParkingService);
  private readonly eventService = inject(EventService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly cdr = inject(ChangeDetectorRef);

  eventId: number | null = null;
  event: EventDetails | null = null;

  // Real backend data
  zones: ParkingZone[] = [];
  slots: ParkingAvailability[] = [];

  // Filter state
  activeZoneFilter: string = 'ALL';
  activeStatusFilter: string = 'ALL';

  // State flags
  loading = true;
  loadError: string | null = null;
  actionMessage: string | null = null;
  actionError: string | null = null;
  submitting = false;

  // Selected slot for inspection
  selectedSlot: ParkingAvailability | null = null;

  // Modals state
  showZoneModal = false;
  showSlotModal = false;
  showDeleteModal = false;
  slotToDelete: ParkingAvailability | null = null;

  // Form models
  newZone: CreateParkingZoneRequest = {
    name: '',
    vehicleType: VehicleType.Car,
    fee: 500,
    isOnlineBookable: true,
    displayOrder: 1
  };

  newSlot: {
    zoneId: number;
    prefix: string;
    startNumber: number;
    count: number;
  } = {
    zoneId: 0,
    prefix: 'P',
    startNumber: 1,
    count: 10
  };

  readonly vehicleTypesList: { label: string; value: VehicleType }[] = [
    { label: 'Car', value: VehicleType.Car },
    { label: 'Van', value: VehicleType.Van },
    { label: 'Motorbike', value: VehicleType.Motorbike },
    { label: 'Three-Wheeler', value: VehicleType.ThreeWheeler }
  ];

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      const parsedId = Number(idParam);
      if (!isNaN(parsedId) && parsedId > 0) {
        this.eventId = parsedId;
        this.loadParkingData();
        return;
      }
    }
    this.loading = false;
    this.loadError = 'Invalid event identifier specified.';
  }

  loadParkingData(): void {
    if (!this.eventId) return;

    this.loading = true;
    this.loadError = null;
    this.actionError = null;

    forkJoin({
      event: this.eventService.getEvent(this.eventId),
      zones: this.parkingService.getEventParkingZones(this.eventId).pipe(catchError(() => of([]))),
      slots: this.parkingService.getEventParkingSlots(this.eventId).pipe(catchError(() => of([])))
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ event, zones, slots }) => {
          this.event = event;
          this.zones = zones || [];
          this.slots = slots || [];
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

  // Filtered slots
  get filteredSlots(): ParkingAvailability[] {
    let result = this.slots;
    if (this.activeZoneFilter !== 'ALL') {
      const zId = Number(this.activeZoneFilter);
      result = result.filter((s) => s.zoneId === zId || s.zoneName === this.activeZoneFilter);
    }
    if (this.activeStatusFilter !== 'ALL') {
      result = result.filter((s) => s.status === this.activeStatusFilter);
    }
    return result;
  }

  // Statistics
  get totalSlotsCount(): number {
    return this.slots.length;
  }

  get availableSlotsCount(): number {
    return this.slots.filter((s) => s.status === 'Available').length;
  }

  get reservedSlotsCount(): number {
    return this.slots.filter((s) => s.status === 'Occupied' || s.status === 'Held').length;
  }

  get occupancyRate(): number {
    if (this.totalSlotsCount === 0) return 0;
    return Math.round((this.reservedSlotsCount / this.totalSlotsCount) * 100);
  }

  get hasActiveBookings(): boolean {
    return (
      (this.event?.hasBookings ?? false) ||
      this.reservedSlotsCount > 0
    );
  }

  // Quick Action: Auto-Generate Default Parking Facility
  onGenerateDefaultParking(): void {
    if (!this.eventId || this.submitting) return;

    this.submitting = true;
    this.actionError = null;
    this.actionMessage = 'Initializing standard parking facility...';

    // 1. Create Zone A: Standard Cars
    const zoneReq: CreateParkingZoneRequest = {
      name: 'Main Lot - Cars',
      vehicleType: VehicleType.Car,
      fee: 500,
      isOnlineBookable: true,
      displayOrder: 1
    };

    this.parkingService.createParkingZone(this.eventId, zoneReq).subscribe({
      next: (createdZone) => {
        // 2. Create 12 slots for this zone
        const observables = [];
        for (let i = 1; i <= 12; i++) {
          const slotReq: CreateParkingSlotRequest = {
            parkingZoneId: createdZone.id,
            slotCode: `C-${String(i).padStart(2, '0')}`,
            displayOrder: i,
            positionX: i * 50,
            positionY: 50
          };
          observables.push(this.parkingService.createParkingSlot(this.eventId!, slotReq));
        }

        forkJoin(observables).subscribe({
          next: () => {
            this.submitting = false;
            this.actionMessage = 'Standard parking facility initialized with 12 slots.';
            setTimeout(() => (this.actionMessage = null), 4000);
            this.loadParkingData();
          },
          error: () => {
            this.submitting = false;
            this.actionMessage = null;
            this.actionError = 'Zone created, but encountered an issue populating some parking slots.';
            this.loadParkingData();
          }
        });
      },
      error: (err: unknown) => {
        this.submitting = false;
        this.handleActionError(err, 'Failed to create parking zone.');
      }
    });
  }

  // Create Zone Modal
  openAddZoneModal(): void {
    this.newZone = {
      name: '',
      vehicleType: VehicleType.Car,
      fee: 500,
      isOnlineBookable: true,
      displayOrder: this.zones.length + 1
    };
    this.showZoneModal = true;
    this.actionError = null;
  }

  onSaveZone(): void {
    if (!this.eventId || !this.newZone.name.trim()) return;

    this.submitting = true;
    this.actionError = null;

    this.parkingService
      .createParkingZone(this.eventId, {
        name: this.newZone.name.trim(),
        vehicleType: Number(this.newZone.vehicleType) as VehicleType,
        fee: Number(this.newZone.fee),
        isOnlineBookable: this.newZone.isOnlineBookable,
        displayOrder: Number(this.newZone.displayOrder)
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.submitting = false;
          this.showZoneModal = false;
          this.actionMessage = 'Parking zone created successfully.';
          setTimeout(() => (this.actionMessage = null), 3000);
          this.loadParkingData();
        },
        error: (err: unknown) => {
          this.submitting = false;
          this.handleActionError(err, 'Failed to create parking zone.');
        }
      });
  }

  // Add Slots Modal
  openAddSlotModal(): void {
    if (this.zones.length === 0) {
      this.actionError = 'Please create at least one parking zone before adding slots.';
      return;
    }
    this.newSlot = {
      zoneId: this.zones[0].id,
      prefix: 'P',
      startNumber: 1,
      count: 10
    };
    this.showSlotModal = true;
    this.actionError = null;
  }

  onSaveSlots(): void {
    if (!this.eventId || !this.newSlot.zoneId || !this.newSlot.prefix.trim() || this.newSlot.count <= 0) return;

    this.submitting = true;
    this.actionError = null;

    const observables = [];
    const prefix = this.newSlot.prefix.trim().toUpperCase();
    const start = Number(this.newSlot.startNumber);
    const count = Number(this.newSlot.count);

    for (let i = 0; i < count; i++) {
      const slotNum = start + i;
      const code = `${prefix}-${String(slotNum).padStart(2, '0')}`;
      const req: CreateParkingSlotRequest = {
        parkingZoneId: Number(this.newSlot.zoneId),
        slotCode: code,
        displayOrder: slotNum,
        positionX: slotNum * 50,
        positionY: 50
      };
      observables.push(this.parkingService.createParkingSlot(this.eventId, req));
    }

    forkJoin(observables)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.submitting = false;
          this.showSlotModal = false;
          this.actionMessage = `Added ${count} parking slot(s) with prefix ${prefix}.`;
          setTimeout(() => (this.actionMessage = null), 3000);
          this.loadParkingData();
        },
        error: (err: unknown) => {
          this.submitting = false;
          this.handleActionError(err, 'Failed to add slots. Slot codes must be unique.');
        }
      });
  }

  // Delete Slot
  onPromptDeleteSlot(slot: ParkingAvailability, event: MouseEvent): void {
    event.stopPropagation();
    if (slot.status === 'Occupied' || slot.status === 'Held') {
      this.actionError = `Cannot delete slot ${slot.slotCode} because it has an active reservation.`;
      return;
    }
    this.slotToDelete = slot;
    this.showDeleteModal = true;
    this.actionError = null;
  }

  onConfirmDeleteSlot(): void {
    if (!this.slotToDelete) return;

    this.submitting = true;
    this.actionError = null;

    this.parkingService
      .deleteParkingSlot(this.slotToDelete.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.submitting = false;
          this.showDeleteModal = false;
          this.slotToDelete = null;
          this.selectedSlot = null;
          this.actionMessage = 'Parking slot deleted successfully.';
          setTimeout(() => (this.actionMessage = null), 3000);
          this.loadParkingData();
        },
        error: (err: unknown) => {
          this.submitting = false;
          this.handleActionError(err, 'Failed to delete parking slot. Active reservation prevents deletion.');
        }
      });
  }

  onSelectSlot(slot: ParkingAvailability): void {
    this.selectedSlot = this.selectedSlot?.id === slot.id ? null : slot;
  }

  private handleActionError(err: unknown, defaultMessage: string): void {
    if (err instanceof HttpErrorResponse) {
      if (err.status === 409) {
        this.actionError = err.error?.detail || err.error?.message || 'Conflict: Active bookings protect this parking resource.';
      } else if (err.status === 400) {
        this.actionError = err.error?.detail || err.error?.message || 'Invalid parking configuration parameters provided.';
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
        this.loadError = 'Failed to load parking configuration.';
      }
    } else {
      this.loadError = 'Failed to connect to parking service.';
    }
  }
}
