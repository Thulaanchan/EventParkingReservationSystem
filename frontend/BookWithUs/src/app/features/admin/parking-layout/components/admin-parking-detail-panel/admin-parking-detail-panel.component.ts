import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';

/**
 * Local presentation projection for single parking slot details view.
 * Decoupled from incomplete M3 domain models.
 */
export interface AdminParkingSlotDetailView {
  id: number;
  slotCode: string;
  zoneId: number;
  zoneName: string;
  vehicleType: string;
  fee: number;
  isOnlineBookable: boolean;
  status: 'Available' | 'Held' | 'Occupied';
  positionX?: number | null;
  positionY?: number | null;
}

/**
 * Presentational component displaying detailed information for a selected parking slot.
 * Enforces strict edit/delete lock safeguards based on real backend statuses (Held / Occupied).
 * Strictly omits customer/booking fields not supported by backend slot contracts.
 */
@Component({
  selector: 'app-admin-parking-detail-panel',
  standalone: true,
  imports: [CommonModule, DecimalPipe],
  templateUrl: './admin-parking-detail-panel.component.html',
  styleUrl: './admin-parking-detail-panel.component.css'
})
export class AdminParkingDetailPanelComponent {
  @Input() slot: AdminParkingSlotDetailView | null = null;
  @Input() deleting = false;
  @Input() disabled = false;

  @Output() editSlot = new EventEmitter<AdminParkingSlotDetailView>();
  @Output() deleteSlot = new EventEmitter<AdminParkingSlotDetailView>();
  @Output() closePanel = new EventEmitter<void>();

  get isLocked(): boolean {
    if (!this.slot) {
      return true;
    }
    return this.slot.status !== 'Available';
  }

  get lockMessage(): string | null {
    if (!this.slot) {
      return null;
    }
    if (this.slot.status === 'Held') {
      return 'This parking slot is temporarily held and cannot be edited or deleted.';
    }
    if (this.slot.status === 'Occupied') {
      return 'This parking slot is occupied and cannot be edited or deleted.';
    }
    return null;
  }

  getVehicleTypeDisplay(type: string | null | undefined): string {
    switch (type) {
      case 'ThreeWheeler':
        return 'Three-Wheeler';
      case 'Car':
        return 'Car';
      case 'Van':
        return 'Van';
      case 'Motorbike':
        return 'Motorbike';
      default:
        return type ?? 'Standard Vehicle';
    }
  }

  getStatusClass(status: string | null | undefined): string {
    switch (status) {
      case 'Available':
        return 'status-available';
      case 'Held':
        return 'status-held';
      case 'Occupied':
        return 'status-occupied';
      default:
        return 'status-neutral';
    }
  }

  onEdit(): void {
    if (this.slot && !this.isLocked && !this.disabled && !this.deleting) {
      this.editSlot.emit(this.slot);
    }
  }

  onDelete(): void {
    if (this.slot && !this.isLocked && !this.disabled && !this.deleting) {
      this.deleteSlot.emit(this.slot);
    }
  }

  onClose(): void {
    this.closePanel.emit();
  }
}
