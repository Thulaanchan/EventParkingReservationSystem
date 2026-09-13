import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './empty-state.component.html',
  styleUrls: ['./empty-state.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EmptyStateComponent {
  /**
   * Main title headline describing the empty state.
   */
  @Input({ required: true }) title!: string;

  /**
   * Optional contextual message explaining the empty state.
   */
  @Input() message?: string;

  /**
   * Optional custom emoji or character icon.
   */
  @Input() icon?: string;

  /**
   * Optional action button label. When provided, renders an action button.
   */
  @Input() actionLabel?: string;

  /**
   * Emits when user clicks the action button.
   */
  @Output() action = new EventEmitter<void>();

  onAction(): void {
    this.action.emit();
  }
}
