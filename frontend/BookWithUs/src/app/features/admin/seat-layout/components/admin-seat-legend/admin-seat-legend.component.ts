import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface SeatLegendCategory {
  id: number;
  name: string;
}

export interface SeatStatusLegendItem {
  id: string;
  label: string;
  description?: string;
  visualClass: string;
}

/**
 * Presentational legend component for the Admin Seat Map view.
 * Displays dynamically supplied categories and standardized seat status markers.
 * Matches ad s 06 m.png.
 */
@Component({
  selector: 'app-admin-seat-legend',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-seat-legend.component.html',
  styleUrl: './admin-seat-legend.component.css'
})
export class AdminSeatLegendComponent {
  @Input() categories: readonly SeatLegendCategory[] = [];
  @Input() showSelected = true;

  get statusItems(): SeatStatusLegendItem[] {
    const items: SeatStatusLegendItem[] = [
      {
        id: 'available',
        label: 'Available',
        visualClass: 'status-marker-available'
      }
    ];

    if (this.showSelected) {
      items.push({
        id: 'selected',
        label: 'Selected',
        description: '(Current UI selection)',
        visualClass: 'status-marker-selected'
      });
    }

    items.push(
      {
        id: 'held',
        label: 'Held',
        description: '(Temporarily held)',
        visualClass: 'status-marker-held'
      },
      {
        id: 'booked',
        label: 'Booked',
        description: '(Confirmed booking)',
        visualClass: 'status-marker-booked'
      }
    );

    return items;
  }

  /**
   * Deterministically assigns a presentation-only CSS color class based on the category's
   * rendered index for visual distinction without implying stored backend color data.
   */
  getCategoryColorClass(index: number): string {
    return `category-color-${index % 6}`;
  }
}
