import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CategoryService } from '../../../../../core/services/categories/category.service';
import { EventCategory } from '../../../../../core/models/categories/event-category.model';
import { CategorySearchComponent } from '../../components/category-search/category-search.component';
import { CategoryStatsComponent } from '../../components/category-stats/category-stats.component';
import { CategoryTableComponent } from '../../components/category-table/category-table.component';
import { CategoryDetailPanelComponent } from '../../components/category-detail-panel/category-detail-panel.component';

@Component({
  selector: 'app-category-management-page',
  standalone: true,
  imports: [
    CommonModule,
    CategorySearchComponent,
    CategoryStatsComponent,
    CategoryTableComponent,
    CategoryDetailPanelComponent
  ],
  templateUrl: './category-management-page.component.html',
  styleUrl: './category-management-page.component.css'
})
export class CategoryManagementPageComponent implements OnInit {
  private readonly categoryService = inject(CategoryService);
  private readonly router = inject(Router);

  // Raw data from backend
  categories: EventCategory[] = [];

  // Filtered categories displayed in table
  filteredCategories: EventCategory[] = [];

  // Component states
  loading = false;
  errorMessage: string | null = null;
  searchTerm = '';

  // Detail panel state
  selectedCategory: EventCategory | null = null;
  deleting = false;
  deleteError: string | null = null;

  // Stats computed getters
  get totalCategories(): number {
    return this.categories.length;
  }

  get categoriesInUse(): number {
    return this.categories.filter(c => c.eventCount > 0).length;
  }

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.loading = true;
    this.errorMessage = null;

    this.categoryService.getCategories().subscribe({
      next: (data) => {
        this.categories = data;
        this.applyFilter();
        this.loading = false;

        // If a category was selected, update its reference with latest data
        if (this.selectedCategory) {
          const updated = this.categories.find(c => c.id === this.selectedCategory!.id);
          this.selectedCategory = updated ?? null;
        }
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage =
          err?.error?.detail ||
          'Failed to load categories. Please try again later.';
      }
    });
  }

  onSearchChange(term: string): void {
    this.searchTerm = term;
    this.applyFilter();
  }

  onClearSearch(): void {
    this.searchTerm = '';
    this.applyFilter();
  }

  private applyFilter(): void {
    const trimmed = this.searchTerm.trim().toLowerCase();
    if (!trimmed) {
      this.filteredCategories = [...this.categories];
    } else {
      this.filteredCategories = this.categories.filter(category =>
        category.name.toLowerCase().includes(trimmed)
      );
    }
  }

  onViewCategory(category: EventCategory): void {
    this.selectedCategory = category;
    this.deleteError = null;
  }

  onCloseDetail(): void {
    this.selectedCategory = null;
    this.deleteError = null;
  }

  onAddCategory(): void {
    this.router.navigate(['/admin/categories/new']);
  }

  onEditCategory(category: EventCategory): void {
    this.router.navigate(['/admin/categories', category.id, 'edit']);
  }

  onDeleteCategory(category: EventCategory): void {
    if (category.eventCount > 0) {
      this.deleteError =
        'This category cannot be deleted because one or more events are using it.';
      return;
    }

    if (this.deleting) {
      return;
    }

    this.deleting = true;
    this.deleteError = null;

    this.categoryService.deleteCategory(category.id).subscribe({
      next: () => {
        this.deleting = false;
        if (this.selectedCategory?.id === category.id) {
          this.selectedCategory = null;
        }
        this.categories = this.categories.filter(c => c.id !== category.id);
        this.applyFilter();
      },
      error: (err) => {
        this.deleting = false;
        if (err?.status === 409) {
          this.deleteError =
            err?.error?.detail ||
            'This category cannot be deleted because one or more events are using it.';
        } else {
          this.deleteError =
            err?.error?.detail ||
            'Failed to delete category. Please try again.';
        }
      }
    });
  }
}
