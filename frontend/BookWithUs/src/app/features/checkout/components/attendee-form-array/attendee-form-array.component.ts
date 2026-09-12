import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
  inject
} from '@angular/core';
import {
  FormArray,
  FormControl,
  FormGroup,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { Subscription } from 'rxjs';
import { AttendeeType } from '../../../../core/models/bookings/attendee-details.model';

/**
 * Seat input interface for AttendeeFormArrayComponent.
 */
export interface SelectedSeatForAttendee {
  seatId: number;
  seatCode: string;
  rowLabel?: string;
  sectionName?: string;
  attendeeName?: string;
  attendeeType?: AttendeeType | number;
  price?: number;
}

/**
 * Emitted attendee data structure matching backend requirements.
 */
export interface AttendeeFormItem {
  seatId: number;
  attendeeName: string;
  attendeeType: number;
}

interface AttendeeRowControls {
  seatId: FormControl<number>;
  attendeeName: FormControl<string>;
  attendeeType: FormControl<number>;
}

@Component({
  selector: 'app-attendee-form-array',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './attendee-form-array.component.html',
  styleUrl: './attendee-form-array.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AttendeeFormArrayComponent implements OnChanges, OnDestroy {
  private readonly fb = inject(NonNullableFormBuilder);
  private formSubscription?: Subscription;

  /**
   * Array of selected seats passed by the parent component.
   */
  @Input() seats: SelectedSeatForAttendee[] = [];

  /**
   * Emits the updated attendee list whenever attendee names or types change.
   */
  @Output() readonly attendeesChanged = new EventEmitter<AttendeeFormItem[]>();

  /**
   * Top-level form holding the attendees FormArray.
   */
  readonly form = this.fb.group({
    attendees: this.fb.array<FormGroup<AttendeeRowControls>>([])
  });

  /**
   * Typed getter for the FormArray.
   */
  get attendeesArray(): FormArray<FormGroup<AttendeeRowControls>> {
    return this.form.controls.attendees;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['seats']) {
      this.rebuildForm();
    }
  }

  ngOnDestroy(): void {
    this.formSubscription?.unsubscribe();
  }

  /**
   * Returns corresponding seat metadata for a specific row index.
   */
  getSeat(index: number): SelectedSeatForAttendee | undefined {
    return this.seats[index];
  }

  /**
   * Checks whether a form control in a row is invalid and touched/dirty.
   */
  isFieldInvalid(index: number, field: keyof AttendeeRowControls): boolean {
    const row = this.attendeesArray.at(index);
    if (!row) {
      return false;
    }
    const control = row.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  private rebuildForm(): void {
    this.formSubscription?.unsubscribe();
    this.attendeesArray.clear({ emitEvent: false });

    for (const seat of this.seats) {
      const initialType =
        seat.attendeeType === AttendeeType.Child || seat.attendeeType === 2
          ? AttendeeType.Child
          : AttendeeType.Adult;

      const row = this.fb.group<AttendeeRowControls>({
        seatId: this.fb.control<number>(seat.seatId),
        attendeeName: this.fb.control<string>(seat.attendeeName || '', {
          validators: [
            Validators.required,
            Validators.minLength(3),
            Validators.maxLength(100)
          ]
        }),
        attendeeType: this.fb.control<number>(initialType)
      });

      this.attendeesArray.push(row, { emitEvent: false });
    }

    this.formSubscription = this.attendeesArray.valueChanges.subscribe(() => {
      this.emitAttendees();
    });
  }

  private emitAttendees(): void {
    const raw = this.attendeesArray.getRawValue();
    const result: AttendeeFormItem[] = raw.map((item) => ({
      seatId: Number(item.seatId),
      attendeeName: (item.attendeeName || '').trim(),
      attendeeType: Number(item.attendeeType)
    }));
    this.attendeesChanged.emit(result);
  }
}
