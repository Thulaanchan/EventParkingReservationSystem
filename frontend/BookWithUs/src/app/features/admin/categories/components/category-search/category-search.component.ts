import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-category-search',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './category-search.component.html',
  styleUrl: './category-search.component.css'
})
export class CategorySearchComponent {
  @Input() searchTerm = '';

  @Output() searchTermChange = new EventEmitter<string>();
  @Output() clearSearch = new EventEmitter<void>();

  onSearchChange(value: string): void {
    this.searchTerm = value;
    this.searchTermChange.emit(value);
  }

  onClear(): void {
    this.searchTerm = '';
    this.searchTermChange.emit('');
    this.clearSearch.emit();
  }
}
