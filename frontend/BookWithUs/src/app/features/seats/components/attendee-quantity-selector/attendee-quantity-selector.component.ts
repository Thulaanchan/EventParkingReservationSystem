import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-attendee-quantity-selector',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './attendee-quantity-selector.component.html',
  styleUrls: ['./attendee-quantity-selector.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AttendeeQuantitySelectorComponent {
  /**
   * Heading label for the attendee row (e.g. 'Adults', 'Children').
   */
  @Input({ required: true }) label = '';

  /**
   * Subtitle description (e.g. 'Ages 13 or above', 'Ages 2–12 (50% of adult price)').
   */
  @Input() description = '';

  /**
   * Current attendee ticket quantity.
   */
  @Input() count = 0;

  /**
   * Whether the counter is disabled.
   */
  @Input() disabled = false;

  /**
   * Visual icon variant matching screen-09.png.
   */
  @Input() iconType: 'adult' | 'child' | 'default' = 'default';

  /**
   * Emits the requested new quantity upward. Does not mutate internal input directly.
   */
  @Output() countChange = new EventEmitter<number>();

  onDecrement(): void {
    if (this.disabled || this.count <= 0) {
      return;
    }
    const next = Math.max(0, this.count - 1);
    this.countChange.emit(next);
  }

  onIncrement(): void {
    if (this.disabled) {
      return;
    }
    this.countChange.emit(this.count + 1);
  }
}
