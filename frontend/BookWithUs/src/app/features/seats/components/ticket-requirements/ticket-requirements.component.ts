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
   * Child tickets are disabled if entire component is disabled or adultCount is 0.
   */
  get isChildDisabled(): boolean {
    return this.disabled || (this.adultCount || 0) === 0;
  }

  /**
   * Dynamic description for child ticket pricing derived from input.
   * If adultCount is 0, alerts user that at least 1 adult is required.
   */
  get childDescription(): string {
    if ((this.adultCount || 0) === 0) {
      return 'Requires at least 1 adult';
    }
    if (this.childDiscountPercent != null && this.childDiscountPercent > 0) {
      return `Ages 2–12 (${this.childDiscountPercent}% discount)`;
    }
    return 'Ages 2–12';
  }

  onAdultCountChange(count: number): void {
    const nextAdult = Math.max(0, count);
    this.adultCountChange.emit(nextAdult);

    // If adults reduced to 0, automatically reset children to 0
    if (nextAdult === 0 && this.childCount > 0) {
      this.childCountChange.emit(0);
    }
  }

  onChildCountChange(count: number): void {
    // Selection of children is strictly not allowed without adults
    if ((this.adultCount || 0) === 0) {
      this.childCountChange.emit(0);
      return;
    }
    this.childCountChange.emit(Math.max(0, count));
  }
}
