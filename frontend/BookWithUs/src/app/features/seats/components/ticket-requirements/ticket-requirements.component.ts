import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { AttendeeQuantitySelectorComponent } from '../attendee-quantity-selector/attendee-quantity-selector.component';

@Component({
  selector: 'app-ticket-requirements',
  standalone: true,
  imports: [CommonModule, AttendeeQuantitySelectorComponent],
  templateUrl: './ticket-requirements.component.html',
  styleUrls: ['./ticket-requirements.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TicketRequirementsComponent {
  /**
   * Current number of adult tickets selected.
   */
  @Input() adultCount = 0;

  /**
   * Current number of child tickets selected.
   */
  @Input() childCount = 0;

  /**
   * Dynamic child discount percentage from backend event contract (e.g. 50 for 50%).
   * Rendered dynamically; not hardcoded.
   */
  @Input() childDiscountPercent: number | null = null;

  /**
   * Whether quantity controls should be disabled.
   */
  @Input() disabled = false;

  /**
   * Emits when the adult quantity changes.
   */
  @Output() adultCountChange = new EventEmitter<number>();

  /**
   * Emits when the child quantity changes.
   */
  @Output() childCountChange = new EventEmitter<number>();

  /**
   * UI-calculated total seats required for this booking.
   */
  get totalSeats(): number {
    return (this.adultCount || 0) + (this.childCount || 0);
  }

  /**
   * Dynamic description for child ticket pricing derived from input.
   */
  get childDescription(): string {
    if (this.childDiscountPercent != null && this.childDiscountPercent > 0) {
      return `Ages 2–12 (${this.childDiscountPercent}% discount)`;
    }
    return 'Ages 2–12';
  }

  onAdultCountChange(count: number): void {
    this.adultCountChange.emit(count);
  }

  onChildCountChange(count: number): void {
    this.childCountChange.emit(count);
  }
}
