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
 * Local UI projection for single seat form data.
 * Completely decoupled from incomplete M3 seat domain models.
 */
export interface AdminSeatFormValue {
  seatSectionId: number;
  rowLabel: string;
  number: number;
  displayOrder: number;
  positionX: number | null;
  positionY: number | null;
}

/**
 * Section dropdown option projection.
 */
export interface AdminSeatFormSectionOption {
  id: number;
  name: string;
  code: string;
  categoryName: string;
}

/**
 * Custom validator rejecting whitespace-only text values.
 */
function nonWhitespaceValidator(control: AbstractControl): ValidationErrors | null {
  if (control.value === null || control.value === undefined || control.value === '') {
    return null; // let Validators.required handle empty
  }
  const isWhitespace = String(control.value).trim().length === 0;
  return isWhitespace ? { whitespace: true } : null;
}

/**
 * Custom validator ensuring numeric value is an integer when provided.
 */
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
 * Presentational and input component for adding or editing a single seat.
 * Strictly adheres to backend Create/Update seat contracts without calling APIs.
 */
@Component({
  selector: 'app-admin-seat-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './admin-seat-form.component.html',
  styleUrl: './admin-seat-form.component.css'
})
export class AdminSeatFormComponent implements OnChanges {
  @Input() mode: 'create' | 'edit' = 'create';
  @Input() value: AdminSeatFormValue | null = null;
  @Input() sections: readonly AdminSeatFormSectionOption[] = [];
  @Input() submitting = false;
  @Input() locked = false;
  @Input() serverError: string | null = null;

  @Output() save = new EventEmitter<AdminSeatFormValue>();
  @Output() cancel = new EventEmitter<void>();

  readonly form = new FormGroup({
    seatSectionId: new FormControl<number | null>(null, [
      Validators.required,
      Validators.min(1)
    ]),
    rowLabel: new FormControl<string>('', [
      Validators.required,
      nonWhitespaceValidator,
      Validators.maxLength(20)
    ]),
    number: new FormControl<number | null>(null, [
      Validators.required,
      Validators.min(1),
      integerValidator
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
        seatSectionId: this.value.seatSectionId,
        rowLabel: this.value.rowLabel,
        number: this.value.number,
        displayOrder: this.value.displayOrder ?? 0,
        positionX: this.value.positionX,
        positionY: this.value.positionY
      });
    } else if (this.mode === 'create') {
      const defaultSectionId = this.sections.length > 0 ? this.sections[0].id : null;
      this.form.reset({
        seatSectionId: defaultSectionId,
        rowLabel: '',
        number: null,
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
    const trimmedRow = (raw.rowLabel ?? '').trim();
    if (!trimmedRow) {
      this.form.controls.rowLabel.setErrors({ required: true });
      return;
    }

    const payload: AdminSeatFormValue = {
      seatSectionId: Number(raw.seatSectionId),
      rowLabel: trimmedRow,
      number: Number(raw.number),
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
