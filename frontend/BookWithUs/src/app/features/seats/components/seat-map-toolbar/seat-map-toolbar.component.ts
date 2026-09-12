import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-seat-map-toolbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './seat-map-toolbar.component.html',
  styleUrls: ['./seat-map-toolbar.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SeatMapToolbarComponent {
  /**
   * Whether the zoom in action can be triggered.
   */
  @Input() canZoomIn = true;

  /**
   * Whether the zoom out action can be triggered.
   */
  @Input() canZoomOut = true;

  /**
   * Whether the reset action can be triggered.
   */
  @Input() canReset = true;

  /**
   * Emits when the customer triggers the map reset action.
   */
  @Output() resetMap = new EventEmitter<void>();

  /**
   * Emits when the customer triggers zoom in.
   */
  @Output() zoomIn = new EventEmitter<void>();

  /**
   * Emits when the customer triggers zoom out.
   */
  @Output() zoomOut = new EventEmitter<void>();

  /**
   * Emits when the customer triggers fit to view.
   */
  @Output() fitMap = new EventEmitter<void>();

  onReset(): void {
    if (this.canReset) {
      this.resetMap.emit();
    }
  }

  onZoomIn(): void {
    if (this.canZoomIn) {
      this.zoomIn.emit();
    }
  }

  onZoomOut(): void {
    if (this.canZoomOut) {
      this.zoomOut.emit();
    }
  }

  onFit(): void {
    this.fitMap.emit();
  }
}
