import { Component, Input } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';

/**
 * Lightweight presentation interface representing section-level seat counts.
 * Strictly a Member 2 UI projection without domain persistence dependencies.
 */
export interface AdminSeatSectionSummaryItem {
  id: number;
  code: string;
  name: string;
  categoryName: string;
  seatCount: number;
  displayOrder: number;
}

/**
 * Presentational component displaying seat counts aggregated per section/category.
 * Matches the Section Summary card in ad s 06 m.png.
 */
@Component({
  selector: 'app-admin-seat-section-summary',
  standalone: true,
  imports: [CommonModule, DecimalPipe],
  templateUrl: './admin-seat-section-summary.component.html',
  styleUrl: './admin-seat-section-summary.component.css'
})
export class AdminSeatSectionSummaryComponent {
  @Input() sections: readonly AdminSeatSectionSummaryItem[] = [];

  get totalSeats(): number {
    return (this.sections ?? []).reduce(
      (sum, s) => sum + Math.max(0, s.seatCount ?? 0),
      0
    );
  }

  getSafeSeatCount(count: number | null | undefined): number {
    if (count == null || isNaN(count)) {
      return 0;
    }
    return Math.max(0, Math.round(count));
  }

  /**
   * Deterministically assigns a presentation-only CSS color class based on the section's
   * rendered index for visual distinction without implying stored backend color data.
   */
  getCategoryColorClass(index: number): string {
    return `category-color-${index % 6}`;
  }
}
