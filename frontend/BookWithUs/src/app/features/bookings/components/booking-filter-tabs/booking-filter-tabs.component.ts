import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

export type BookingFilterTab = 'All' | 'Pending' | 'Confirmed' | 'Cancelled' | 'Expired';

export const BOOKING_FILTER_TABS: readonly BookingFilterTab[] = [
  'All',
  'Pending',
  'Confirmed',
  'Cancelled',
  'Expired'
];

@Component({
  selector: 'app-booking-filter-tabs',
  standalone: true,
  templateUrl: './booking-filter-tabs.component.html',
  styleUrl: './booking-filter-tabs.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BookingFilterTabsComponent {
  @Input() activeTab: BookingFilterTab = 'All';
  @Input() counts?: Partial<Record<BookingFilterTab, number>>;

  @Output() readonly tabChange = new EventEmitter<BookingFilterTab>();

  readonly tabs = BOOKING_FILTER_TABS;

  onSelectTab(tab: BookingFilterTab): void {
    if (this.activeTab !== tab) {
      this.tabChange.emit(tab);
    }
  }

  getTabCount(tab: BookingFilterTab): number | null {
    if (!this.counts) return null;
    const count = this.counts[tab];
    return typeof count === 'number' ? count : null;
  }
}
