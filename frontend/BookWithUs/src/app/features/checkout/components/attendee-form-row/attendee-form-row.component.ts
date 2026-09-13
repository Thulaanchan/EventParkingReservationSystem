import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-attendee-form-row',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './attendee-form-row.component.html',
  styleUrl: './attendee-form-row.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AttendeeFormRowComponent {
  /**
   * FormGroup representing the single attendee entry row.
   */
  @Input({ required: true }) formGroup!: FormGroup;

  /**
   * Seat code label (e.g. 'A12', 'P-N-03').
   */
  @Input({ required: true }) seatCode!: string;

  /**
   * Identifier of the seat.
   */
  @Input({ required: true }) seatId!: number;

  /**
   * Optional row label for display context.
   */
  @Input() rowLabel?: string;

  /**
   * Optional section or tier name.
   */
  @Input() sectionName?: string;

  /**
   * Checks whether the attendee name input is invalid and dirty/touched.
   */
  get isAttendeeNameInvalid(): boolean {
    const control = this.formGroup?.get('attendeeName');
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  /**
   * Returns validation errors on the attendeeName control.
   */
  get attendeeNameErrors() {
    return this.formGroup?.get('attendeeName')?.errors;
  }
}
