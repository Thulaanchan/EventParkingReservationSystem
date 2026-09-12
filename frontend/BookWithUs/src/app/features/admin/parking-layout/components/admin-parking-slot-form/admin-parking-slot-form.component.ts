import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators
} from '@angular/forms';

/**
 * Local UI projection for single parking slot form data.
 * Decoupled from incomplete M3 domain models.
 */
export interface AdminParkingSlotFormValue {
  parkingZoneId: number;
  slotCode: string;
  displayOrder: number;
  positionX: number | null;
  positionY: number | null;
}

/**
 * Zone option projection for dropdown.
 */
export interface AdminParkingZoneOption {
  id: number;
  name: string;
  vehicleType: string;
}

function nonWhitespaceValidator(control: AbstractControl): ValidationErrors | null {
  if (control.value === null || control.value === undefined || control.value === '') {
    return null;
  }
  const isWhitespace = String(control.value).trim().length === 0;
  return isWhitespace ? { whitespace: true } : null;
}

function integerValidator(control: AbstractControl): ValidationErrors | null {
  if (control.value === null || control.value === undefined || control.value === '') {
    return null;
  }
  const val = Number(control.value);
  if (isNaN(val) || !Number.isInteger(val)) {
    return { integer: true };
  }
  return null;
}

/**
 * Presentational and form component for creating or editing a single parking slot.
 * Strictly adheres to backend Create/Update slot contracts without calling APIs.
 */
@Component({
  selector: 'app-admin-parking-slot-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './admin-parking-slot-form.component.html',
  styleUrl: './admin-parking-slot-form.component.css'
})
export class AdminParkingSlotFormComponent implements OnChanges {
  @Input() mode: 'create' | 'edit' = 'create';
  @Input() value: AdminParkingSlotFormValue | null = null;
  @Input() zones: readonly AdminParkingZoneOption[] = [];
  @Input() submitting = false;
  @Input() locked = false;
  @Input() serverError: string | null = null;

  @Output() save = new EventEmitter<AdminParkingSlotFormValue>();
  @Output() cancel = new EventEmitter<void>();

  readonly form = new FormGroup({
    parkingZoneId: new FormControl<number | null>(null, [
      Validators.required,
      Validators.min(1)
    ]),
    slotCode: new FormControl<string>('', [
      Validators.required,
      nonWhitespaceValidator,
      Validators.maxLength(30)
    ]),
    displayOrder: new FormControl<number | null>(0, [
      Validators.required,
      Validators.min(0),
      integerValidator
    ]),
    positionX: new FormControl<number | null>(null),
    positionY: new FormControl<number | null>(null)
  });

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['value'] || changes['mode']) {
      this.populateForm();
    }

    if (changes['locked'] || changes['submitting']) {
      this.updateDisabledState();
    }
  }

  private populateForm(): void {
    if (this.value) {
      this.form.patchValue({
        parkingZoneId: this.value.parkingZoneId,
        slotCode: this.value.slotCode,
        displayOrder: this.value.displayOrder ?? 0,
        positionX: this.value.positionX,
        positionY: this.value.positionY
      });
    } else if (this.mode === 'create') {
      const defaultZoneId = this.zones.length > 0 ? this.zones[0].id : null;
      this.form.reset({
        parkingZoneId: defaultZoneId,
        slotCode: '',
        displayOrder: 0,
        positionX: null,
        positionY: null
      });
    }
    this.updateDisabledState();
  }

  private updateDisabledState(): void {
    if (this.locked || this.submitting) {
      this.form.disable({ emitEvent: false });
    } else {
      this.form.enable({ emitEvent: false });
    }
  }

  onSubmit(): void {
    if (this.locked || this.submitting) {
      return;
    }

    this.form.markAllAsTouched();

    if (this.form.invalid) {
      return;
    }

    const raw = this.form.getRawValue();
    const trimmedCode = (raw.slotCode ?? '').trim();
    if (!trimmedCode) {
      this.form.controls.slotCode.setErrors({ required: true });
      return;
    }

    const payload: AdminParkingSlotFormValue = {
      parkingZoneId: Number(raw.parkingZoneId),
      slotCode: trimmedCode,
      displayOrder: Number(raw.displayOrder ?? 0),
      positionX: this.normalizeNullableNumber(raw.positionX),
      positionY: this.normalizeNullableNumber(raw.positionY)
    };

    this.save.emit(payload);
  }

  onCancel(): void {
    this.cancel.emit();
  }

  private normalizeNullableNumber(val: number | null | undefined): number | null {
    if (val === null || val === undefined || val === ('' as unknown)) {
      return null;
    }
    const num = Number(val);
    return isNaN(num) ? null : num;
  }
}
