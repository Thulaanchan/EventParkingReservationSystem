import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { EventCategory } from '../../../../../core/models/categories/event-category.model';
import { CreateCategoryRequest } from '../../../../../core/models/categories/create-category-request.model';
import { UpdateCategoryRequest } from '../../../../../core/models/categories/update-category-request.model';

@Component({
  selector: 'app-category-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './category-form.component.html',
  styleUrl: './category-form.component.css'
})
export class CategoryFormComponent implements OnChanges {
  @Input() category: EventCategory | null = null;
  @Input() submitting = false;
  @Input() serverError: string | null = null;

  @Output() save = new EventEmitter<CreateCategoryRequest | UpdateCategoryRequest>();
  @Output() cancel = new EventEmitter<void>();

  categoryName = '';

  get isEditMode(): boolean {
    return !!this.category && this.category.id > 0;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['category']) {
      this.categoryName = this.category?.name ?? '';
    }
  }

  onSubmit(form: NgForm): void {
    if (form.invalid || this.submitting) {
      return;
    }

    const trimmedName = this.categoryName.trim();
    if (!trimmedName) {
      return;
    }

    const request: CreateCategoryRequest | UpdateCategoryRequest = {
      name: trimmedName
    };

    this.save.emit(request);
  }

  onCancel(): void {
    this.cancel.emit();
  }
}
