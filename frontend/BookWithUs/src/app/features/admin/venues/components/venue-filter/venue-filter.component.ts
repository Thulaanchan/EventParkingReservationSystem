import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface CapacityFilterOption {
  value: string;
  label: string;
}

@Component({
  selector: 'app-venue-filter',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './venue-filter.component.html',
  styleUrl: './venue-filter.component.css'
})
export class VenueFilterComponent {
  @Input() searchTerm = '';
  @Input() capacityFilter = '';
  @Input() capacityOptions: readonly CapacityFilterOption[] = [];

  @Output() searchTermChange = new EventEmitter<string>();
  @Output() capacityFilterChange = new EventEmitter<string>();
  @Output() clearFilters = new EventEmitter<void>();

  onSearchChange(value: string): void {
    this.searchTerm = value;
    this.searchTermChange.emit(value);
  }

  onCapacityChange(value: string): void {
    this.capacityFilter = value;
    this.capacityFilterChange.emit(value);
  }

  onClear(): void {
    this.searchTerm = '';
    this.capacityFilter = '';
    this.searchTermChange.emit('');
    this.capacityFilterChange.emit('');
    this.clearFilters.emit();
  }
}
