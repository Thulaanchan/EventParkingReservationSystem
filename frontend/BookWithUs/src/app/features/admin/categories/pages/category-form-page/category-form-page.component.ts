import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CategoryService } from '../../../../../core/services/categories/category.service';
import { EventCategory } from '../../../../../core/models/categories/event-category.model';
import { CreateCategoryRequest } from '../../../../../core/models/categories/create-category-request.model';
import { UpdateCategoryRequest } from '../../../../../core/models/categories/update-category-request.model';
import { CategoryFormComponent } from '../../components/category-form/category-form.component';

@Component({
  selector: 'app-category-form-page',
  standalone: true,
  imports: [CommonModule, RouterLink, CategoryFormComponent],
  templateUrl: './category-form-page.component.html',
  styleUrl: './category-form-page.component.css'
})
export class CategoryFormPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly categoryService = inject(CategoryService);

  categoryId: number | null = null;
  category: EventCategory | null = null;

  loading = false;
  loadError: string | null = null;

  submitting = false;
  submitError: string | null = null;

  get isEditMode(): boolean {
    return this.categoryId !== null && this.categoryId > 0;
  }

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      const parsedId = Number(idParam);
      if (!isNaN(parsedId) && parsedId > 0) {
        this.categoryId = parsedId;
        this.loadCategory(parsedId);
      } else {
        this.loadError = 'Invalid category ID provided.';
      }
    }
  }

  loadCategory(id: number): void {
    this.loading = true;
    this.loadError = null;

    this.categoryService.getCategory(id).subscribe({
      next: (data) => {
        this.category = data;
        this.loading = false;
      },
      error: (err: HttpErrorResponse) => {
        this.loading = false;
        if (err.status === 404) {
          this.loadError = 'The requested category could not be found.';
        } else {
          this.loadError =
            err.error?.detail ||
            'Failed to load category details. Please try again.';
        }
      }
    });
  }

  onSave(request: CreateCategoryRequest | UpdateCategoryRequest): void {
    if (this.submitting) {
      return;
    }

    this.submitting = true;
    this.submitError = null;

    if (this.isEditMode && this.categoryId) {
      this.categoryService.updateCategory(this.categoryId, request).subscribe({
        next: () => {
          this.submitting = false;
          this.router.navigate(['/admin/categories']);
        },
        error: (err: HttpErrorResponse) => {
          this.submitting = false;
          this.handleSubmitError(err, 'update');
        }
      });
    } else {
      this.categoryService.createCategory(request).subscribe({
        next: () => {
          this.submitting = false;
          this.router.navigate(['/admin/categories']);
        },
        error: (err: HttpErrorResponse) => {
          this.submitting = false;
          this.handleSubmitError(err, 'create');
        }
      });
    }
  }

  onCancel(): void {
    this.router.navigate(['/admin/categories']);
  }

  private handleSubmitError(err: HttpErrorResponse, action: 'create' | 'update'): void {
    if (err.status === 409) {
      this.submitError =
        err.error?.detail ||
        'A category with this name already exists. Please choose a different name.';
    } else if (err.status === 400) {
      this.submitError =
        err.error?.detail ||
        'Invalid category data. Please check the name and try again.';
    } else if (err.status === 404 && action === 'update') {
      this.submitError = 'Category was not found and could not be updated.';
    } else {
      this.submitError =
        err.error?.detail ||
        `An unexpected error occurred while ${action === 'create' ? 'creating' : 'updating'} the category. Please try again.`;
    }
  }
}
