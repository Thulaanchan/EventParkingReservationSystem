import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type SpinnerSize = 'small' | 'medium' | 'large';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './loading-spinner.component.html',
  styleUrls: ['./loading-spinner.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoadingSpinnerComponent {
  /**
   * User-facing text displayed alongside the animated spinner.
   * Defaults to generic "Loading...".
   */
  @Input() message = 'Loading...';

  /**
   * Display size of the circular spinner.
   */
  @Input() size: SpinnerSize = 'medium';
}
