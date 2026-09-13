import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EventFilter } from '../../../../core/models/events/event-filter.model';
import { Venue } from '../../../../core/models/venues/venue.model';
import { EventCategory } from '../../../../core/models/categories/event-category.model';

@Component({
  selector: 'app-event-filter',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './event-filter.component.html',
  styleUrl: './event-filter.component.css'
})
export class EventFilterComponent implements OnChanges {
  @Input() filter: EventFilter = {};
  @Input() venues: Venue[] = [];
  @Input() categories: EventCategory[] = [];
  @Input() loadingOptions = false;

  @Output() filterChange = new EventEmitter<EventFilter>();
  @Output() clearFilters = new EventEmitter<void>();

  search = '';
  venue: number | null = null;
  category: number | null = null;
  date = '';
  time = '';

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['filter'] && this.filter) {
      this.search = this.filter.search ?? '';
      this.venue =
        this.filter.venue !== undefined && this.filter.venue !== null
          ? Number(this.filter.venue)
          : null;
      this.category =
        this.filter.category !== undefined && this.filter.category !== null
          ? Number(this.filter.category)
          : null;
      this.date = this.filter.date ?? '';
      this.time = this.filter.time ?? '';
    }
  }

  onSearchChange(value: string): void {
    this.search = value;
    this.emitFilterChange();
  }

  onVenueChange(value: number | null): void {
    this.venue = value;
    this.emitFilterChange();
  }

  onCategoryChange(value: number | null): void {
    this.category = value;
    this.emitFilterChange();
  }

  onDateChange(value: string): void {
    this.date = value;
    this.emitFilterChange();
  }

  onTimeChange(value: string): void {
    this.time = value;
    this.emitFilterChange();
  }

  onClear(): void {
    this.search = '';
    this.venue = null;
    this.category = null;
    this.date = '';
    this.time = '';
    this.clearFilters.emit();
    this.emitFilterChange();
  }

  private emitFilterChange(): void {
    const updatedFilter: EventFilter = {
      ...this.filter,
      search: this.search && this.search.trim() ? this.search.trim() : null,
      venue: this.venue,
      category: this.category,
      date: this.date ? this.date : null,
      time: this.time ? this.time : null
    };

    this.filterChange.emit(updatedFilter);
  }
}
