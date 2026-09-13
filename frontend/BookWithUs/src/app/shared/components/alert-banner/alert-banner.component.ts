import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output
} from '@angular/core';
import { CommonModule } from '@angular/common';

export type AlertVariant = 'info' | 'success' | 'warning' | 'error';

@Component({
  selector: 'app-alert-banner',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './alert-banner.component.html',
  styleUrls: ['./alert-banner.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AlertBannerComponent {
  /**
   * Main text message displayed in the alert.
   */
  @Input({ required: true }) message!: string;

  /**
   * Semantic visual variant of the alert.
   */
  @Input() variant: AlertVariant = 'info';

  /**
   * Whether to display an accessible dismiss button.
   */
  @Input() dismissible = false;

  /**
   * Optional bold prefix/headline.
   */
  @Input() title?: string;

  /**
   * Emits when the user clicks the dismiss button.
   */
  @Output() dismiss = new EventEmitter<void>();

  /**
   * Semantic ARIA role: alerts for error/warning, status for info/success.
   */
  get roleAttribute(): string {
    return this.variant === 'error' || this.variant === 'warning'
      ? 'alert'
      : 'status';
  }

  onDismiss(): void {
    this.dismiss.emit();
  }
}
