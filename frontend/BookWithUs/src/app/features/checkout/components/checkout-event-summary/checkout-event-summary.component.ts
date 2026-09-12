import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

/**
 * Event data interface consumed by CheckoutEventSummaryComponent.
 */
export interface CheckoutEventSummaryData {
  eventId?: number;
  eventName: string;
  posterUrl?: string | null;
  eventDate?: string | null;
  startTime?: string | null;
  endTime?: string | null;
  venueName?: string | null;
  categoryName?: string | null;
  description?: string | null;
}

@Component({
  selector: 'app-checkout-event-summary',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './checkout-event-summary.component.html',
  styleUrl: './checkout-event-summary.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CheckoutEventSummaryComponent {
  /**
   * Event summary data provided by parent component.
   */
  @Input() event: CheckoutEventSummaryData | null = null;

  /**
   * Safe fallback poster URL when event poster is missing or fails to load.
   */
  readonly fallbackPosterUrl =
    'https://placehold.co/600x400/4f46e5/ffffff?text=Event+Poster';

  /**
   * Replaces broken poster image with fallback placeholder.
   */
  onImageError(e: Event): void {
    const img = e.target as HTMLImageElement;
    if (img) {
      img.src = this.fallbackPosterUrl;
    }
  }
}
