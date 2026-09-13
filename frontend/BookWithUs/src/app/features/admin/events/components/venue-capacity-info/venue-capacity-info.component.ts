import { Component, Input } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { Venue } from '../../../../../../core/models/venues/venue.model';

/**
 * Presentational component displaying venue capacity metrics, allocation,
 * and capacity restriction safeguards for event configuration.
 */
@Component({
  selector: 'app-venue-capacity-info',
  standalone: true,
  imports: [CommonModule, DecimalPipe],
  templateUrl: './venue-capacity-info.component.html',
  styleUrl: './venue-capacity-info.component.css'
})
export class VenueCapacityInfoComponent {
  @Input() venue: Venue | null = null;
  @Input() eventCapacity: number | null = null;
  @Input() capacityLocked = false;

  get isVenueSelected(): boolean {
    return !!this.venue;
  }

  get hasValidEventCapacity(): boolean {
    return (
      this.eventCapacity !== null &&
      this.eventCapacity !== undefined &&
      this.eventCapacity > 0
    );
  }

  get isOverCapacity(): boolean {
    if (!this.venue || !this.hasValidEventCapacity) {
      return false;
    }
    return (this.eventCapacity ?? 0) > this.venue.totalCapacity;
  }

  get remainingCapacity(): number | null {
    if (!this.venue || !this.hasValidEventCapacity) {
      return null;
    }
    const remaining = this.venue.totalCapacity - (this.eventCapacity ?? 0);
    return Math.max(0, remaining);
  }

  get allocationPercentage(): number | null {
    if (!this.venue || !this.hasValidEventCapacity || this.venue.totalCapacity <= 0) {
      return null;
    }
    const pct = Math.round(((this.eventCapacity ?? 0) / this.venue.totalCapacity) * 100);
    return Math.min(100, Math.max(0, pct));
  }
}
