import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';

/**
 * Local UI projection for zone fee editing.
 * Decoupled from incomplete M3 domain models.
 */
export interface AdminParkingFeeZone {
  id: number;
  name: string;
  fee: number;
  isOnlineBookable: boolean;
}

/**
 * Presentational and form component for managing parking zone fees.
 * Explicitly associates fee with specific parking zones rather than implying an event-wide fee.
 * Strictly adheres to backend UpdateParkingZoneRequest constraints without calling APIs.
 */
@Component({
  selector: 'app-parking-fee-editor',
  standalone: true,
  imports: [CommonModule, DecimalPipe, ReactiveFormsModule],
  templateUrl: './parking-fee-editor.component.html',
  styleUrl: './parking-fee-editor.component.css'
})
export class ParkingFeeEditorComponent implements OnChanges {
  @Input() zones: readonly AdminParkingFeeZone[] = [];
  @Input() selectedZoneId: number | null = null;
  @Input() submitting = false;
  @Input() disabled = false;
  @Input() serverError: string | null = null;

  @Output() zoneChange = new EventEmitter<number>();
  @Output() feeSave = new EventEmitter<{ zoneId: number; fee: number }>();

  readonly feeControl = new FormControl<number | null>(null, [
    Validators.required,
    Validators.min(0)
  ]);

  get activeZone(): AdminParkingFeeZone | null {
    if (this.selectedZoneId !== null) {
      const found = this.zones.find((z) => z.id === this.selectedZoneId);
      if (found) {
        return found;
      }
    }
    return this.zones.length > 0 ? this.zones[0] : null;
  }

  get isFeeUnchanged(): boolean {
    if (!this.activeZone || this.feeControl.value === null) {
      return true;
    }
    return Number(this.feeControl.value) === Number(this.activeZone.fee);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['zones'] || changes['selectedZoneId']) {
      this.syncFeeControl();
    }

    if (changes['submitting'] || changes['disabled']) {
      if (this.submitting || this.disabled) {
        this.feeControl.disable({ emitEvent: false });
      } else {
        this.feeControl.enable({ emitEvent: false });
      }
    }
  }

  private syncFeeControl(): void {
    const zone = this.activeZone;
    if (zone) {
      this.feeControl.setValue(zone.fee, { emitEvent: false });
    } else {
      this.feeControl.reset(null, { emitEvent: false });
    }
  }

  onZoneSelectChange(event: Event): void {
    const select = event.target as HTMLSelectElement | null;
    if (select && select.value) {
      const id = Number(select.value);
      if (!isNaN(id) && id > 0) {
        this.onSelectZone(id);
      }
    }
  }

  onSelectZone(zoneId: number): void {
    if (!this.disabled && !this.submitting) {
      this.zoneChange.emit(zoneId);
    }
  }

  onSave(): void {
    if (this.disabled || this.submitting || !this.activeZone) {
      return;
    }

    this.feeControl.markAsTouched();

    if (this.feeControl.invalid || this.feeControl.value === null) {
      return;
    }

    const newFee = Number(this.feeControl.value);
    if (isNaN(newFee) || newFee < 0) {
      return;
    }

    this.feeSave.emit({
      zoneId: this.activeZone.id,
      fee: newFee
    });
  }
}
