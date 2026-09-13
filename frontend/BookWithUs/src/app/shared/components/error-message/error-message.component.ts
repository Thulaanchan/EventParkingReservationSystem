import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-error-message',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './error-message.component.html',
  styleUrls: ['./error-message.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ErrorMessageComponent {
  /**
   * User-facing error message to display. Must be converted from API errors by parent.
   */
  @Input() message = 'An unexpected error occurred. Please try again.';

  /**
   * Optional bold headline for the error card.
   */
  @Input() title?: string;

  /**
   * Whether to display an interactive retry action button.
   */
  @Input() showRetry = false;

  /**
   * Accessible button label for the retry action.
   */
  @Input() retryLabel = 'Try Again';

  /**
   * Emits when user clicks the retry button.
   */
  @Output() retry = new EventEmitter<void>();

  onRetry(): void {
    this.retry.emit();
  }
}
