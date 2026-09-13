import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-category-stats',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './category-stats.component.html',
  styleUrl: './category-stats.component.css'
})
export class CategoryStatsComponent {
  @Input() totalCategories = 0;
  @Input() categoriesInUse = 0;
}
