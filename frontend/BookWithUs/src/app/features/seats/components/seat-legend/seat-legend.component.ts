import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EventSeatCategory } from '../../../../core/models/seats/event-seat-category.model';

export interface SeatStatusLegendItem {
  id: string;
  label: string;
  description: string;
  cssClass: string;
  symbol?: string;
}

@Component({
  selector: 'app-seat-legend',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './seat-legend.component.html',
  styleUrls: ['./seat-legend.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SeatLegendComponent {
  /**
   * Optional backend-driven seat categories for the event.
   * If provided, renders category names and pricing information dynamically.
   */
  @Input() categories: EventSeatCategory[] = [];

  /**
   * Static status items explaining seat map visual states to customers.
   * Available, Held, and Booked match backend persisted states.
   * Selected is purely a client-side UI state.
   * VIP Pre-Reserved is derived from public bookability.
   */
  readonly statusItems: readonly SeatStatusLegendItem[] = [
    {
      id: 'available',
      label: 'Available',
      description: 'Seats available for selection',
      cssClass: 'legend-swatch-available'
    },
    {
      id: 'selected',
      label: 'Selected',
      description: 'Your selected seat',
      cssClass: 'legend-swatch-selected'
    },
    {
      id: 'held',
      label: 'Held',
      description: 'Temporarily held',
      cssClass: 'legend-swatch-held'
    },
    {
      id: 'booked',
      label: 'Booked',
      description: 'Already booked by others',
      cssClass: 'legend-swatch-booked'
    },
    {
      id: 'vip',
      label: 'VIP Pre-Reserved',
      description: 'Reserved for VIP guests',
      cssClass: 'legend-swatch-vip',
      symbol: '★'
    }
  ];

  /**
   * Maps category metadata to a semantic dot styling class matching screen-09.png.
   */
  getCategoryDotClass(category: EventSeatCategory): string {
    if (!category.isPubliclyBookable) {
      return 'category-dot-vip';
    }

    const identifier = (category.code || category.name || '').toLowerCase();
    if (identifier.includes('plat')) {
      return 'category-dot-platinum';
    }
    if (identifier.includes('gold')) {
      return 'category-dot-gold';
    }
    if (identifier.includes('silver')) {
      return 'category-dot-silver';
    }

    return 'category-dot-default';
  }
}
