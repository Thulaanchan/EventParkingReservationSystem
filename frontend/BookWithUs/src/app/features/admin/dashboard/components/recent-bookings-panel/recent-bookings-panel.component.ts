import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { RecentBooking } from '../../../../../../core/models/dashboards/admin-dashboard.model';

/**
 * Presentational panel component for the Admin Dashboard Recent Bookings section.
 * Renders real backend metrics from RecentBooking matching as-01.png.
 */
@Component({
  selector: 'app-recent-bookings-panel',
  standalone: true,
  imports: [CommonModule, DatePipe, DecimalPipe],
  templateUrl: './recent-bookings-panel.component.html',
  styleUrl: './recent-bookings-panel.component.css'
})
export class RecentBookingsPanelComponent {
  @Input() bookings: RecentBooking[] = [];
  @Input() loading = false;

  @Output() viewBooking = new EventEmitter<RecentBooking>();
  @Output() viewAll = new EventEmitter<void>();

  readonly skeletonRows = [1, 2, 3, 4];

  onViewBooking(booking: RecentBooking): void {
    this.viewBooking.emit(booking);
  }

  onViewAll(): void {
    this.viewAll.emit();
  }

  /**
   * Maps backend status strings to CSS presentation classes safely.
   * Unknown statuses default to neutral styling without hiding or altering the text.
   */
  getStatusClass(status: string | null | undefined): string {
    if (!status) {
      return 'status-neutral';
    }
    const s = status.trim().toLowerCase();
    switch (s) {
      case 'confirmed':
      case 'completed':
      case 'paid':
      case 'active':
        return 'status-success';
      case 'pending':
      case 'reserved':
      case 'processing':
        return 'status-warning';
      case 'cancelled':
      case 'canceled':
      case 'failed':
      case 'rejected':
        return 'status-danger';
      case 'refunded':
        return 'status-info';
      default:
        return 'status-neutral';
    }
  }
}
