import {
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  Output
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { EventCategory } from '../../../../../core/models/categories/event-category.model';

@Component({
  selector: 'app-category-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './category-table.component.html',
  styleUrl: './category-table.component.css'
})
export class CategoryTableComponent {
  @Input() categories: EventCategory[] = [];
  @Input() loading = false;

  @Output() viewCategory = new EventEmitter<EventCategory>();
  @Output() editCategory = new EventEmitter<EventCategory>();
  @Output() deleteCategory = new EventEmitter<EventCategory>();

  activeMenuCategoryId: number | null = null;

  constructor(private readonly elementRef: ElementRef) {}

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.closeMenu();
    }
  }

  toggleMenu(categoryId: number, event: MouseEvent): void {
    event.stopPropagation();
    if (this.activeMenuCategoryId === categoryId) {
      this.activeMenuCategoryId = null;
    } else {
      this.activeMenuCategoryId = categoryId;
    }
  }

  closeMenu(): void {
    this.activeMenuCategoryId = null;
  }

  onView(category: EventCategory): void {
    this.closeMenu();
    this.viewCategory.emit(category);
  }

  onEdit(category: EventCategory): void {
    this.closeMenu();
    this.editCategory.emit(category);
  }

  onDelete(category: EventCategory): void {
    this.closeMenu();
    this.deleteCategory.emit(category);
  }
}
