import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EventCategory } from '../../../../../core/models/categories/event-category.model';

@Component({
  selector: 'app-category-detail-panel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './category-detail-panel.component.html',
  styleUrl: './category-detail-panel.component.css'
})
export class CategoryDetailPanelComponent {
  @Input() category: EventCategory | null = null;
  @Input() deleting = false;
  @Input() serverError: string | null = null;

  @Output() close = new EventEmitter<void>();
  @Output() edit = new EventEmitter<EventCategory>();
  @Output() delete = new EventEmitter<EventCategory>();

  onClose(): void {
    this.close.emit();
  }

  onEdit(): void {
    if (this.category) {
      this.edit.emit(this.category);
    }
  }

  onDelete(): void {
    if (this.category && this.category.eventCount === 0 && !this.deleting) {
      this.delete.emit(this.category);
    }
  }
}
