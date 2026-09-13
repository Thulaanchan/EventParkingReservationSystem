import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-parking-map-toolbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './parking-map-toolbar.component.html',
  styleUrls: ['./parking-map-toolbar.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ParkingMapToolbarComponent {
  /**
   * Whether the reset action is currently enabled.
   */
  @Input() canReset = true;

  /**
   * Whether the zoom in action is currently enabled.
   */
  @Input() canZoomIn = true;

  /**
   * Whether the zoom out action is currently enabled.
   */
  @Input() canZoomOut = true;

  /**
   * Emits when customer triggers the map reset action.
   */
  @Output() resetMap = new EventEmitter<void>();

  /**
   * Emits when customer triggers zoom in.
   */
  @Output() zoomIn = new EventEmitter<void>();

  /**
   * Emits when customer triggers zoom out.
   */
  @Output() zoomOut = new EventEmitter<void>();

  /**
   * Emits when customer triggers fit-to-view.
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
