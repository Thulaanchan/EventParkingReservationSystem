import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SeatSection } from '../../../../core/models/seats/seat-section.model';
import { EventSeatCategory } from '../../../../core/models/seats/event-seat-category.model';

@Component({
  selector: 'app-seat-section-summary',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './seat-section-summary.component.html',
  styleUrls: ['./seat-section-summary.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SeatSectionSummaryComponent {
  /**
   * Real backend seat section metadata list.
   */
  @Input() sections: readonly SeatSection[] = [];

  /**
   * Optional backend seat categories for pricing and bookability context.
   */
  @Input() categories: readonly EventSeatCategory[] = [];

  /**
   * Optional explicit venue capacity or total seat count.
   */
  @Input() totalVenueSeats?: number | null = null;

  /**
   * Computes dynamic total seat count across all sections (or venue capacity).
   */
  get totalSeats(): number {
    if (this.totalVenueSeats != null && this.totalVenueSeats > 0) {
      return this.totalVenueSeats;
    }
    return this.sections.reduce((sum, s) => sum + (s.seatCount || 0), 0);
  }

  /**
   * Category dot style resolver matching screen-09.png.
   */
  getCategoryDotClass(categoryNameOrCode: string): string {
    const name = (categoryNameOrCode || '').toLowerCase();
    if (name.includes('plat')) {
      return 'dot-platinum';
    }
    if (name.includes('gold')) {
      return 'dot-gold';
    }
    if (name.includes('silv')) {
      return 'dot-silver';
    }
    if (name.includes('vip')) {
      return 'dot-vip';
    }
    return 'dot-default';
  }

  /**
   * Resolves price or bookability tag for a section if matching category exists.
   */
  getCategoryForSection(section: SeatSection): EventSeatCategory | undefined {
    if (!this.categories || this.categories.length === 0) {
      return undefined;
    }
    return this.categories.find(c =>
      (section.eventSeatCategoryId && c.id === section.eventSeatCategoryId) ||
      (section.categoryName && c.name?.toLowerCase() === section.categoryName.toLowerCase()) ||
      (section.code && c.code?.toLowerCase() === section.code.toLowerCase())
    );
  }
}
