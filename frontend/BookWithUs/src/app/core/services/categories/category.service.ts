import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, of } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { EventCategory } from '../../models/categories/event-category.model';
import { CreateCategoryRequest } from '../../models/categories/create-category-request.model';
import { UpdateCategoryRequest } from '../../models/categories/update-category-request.model';

export const DEFAULT_ADMIN_CATEGORIES: EventCategory[] = [
  { id: 2, name: 'Music Concert', eventCount: 8 },
  { id: 5, name: 'Technology', eventCount: 4 },
  { id: 8, name: 'Cultural', eventCount: 3 },
  { id: 9, name: 'Business & Networking', eventCount: 3 },
  { id: 10, name: 'Education', eventCount: 2 },
  { id: 3, name: 'Sports & Fitness', eventCount: 2 },
  { id: 4, name: 'Theatre & Arts', eventCount: 2 }
];

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/categories`;

  getCategories(): Observable<EventCategory[]> {
    return this.http.get<EventCategory[]>(this.baseUrl).pipe(
      map((items) => {
        if (!items || items.length === 0) {
          return DEFAULT_ADMIN_CATEGORIES;
        }
        const existingNames = new Set(items.map((c) => c.name.toLowerCase()));
        const merged = [...items];
        for (const def of DEFAULT_ADMIN_CATEGORIES) {
          if (!existingNames.has(def.name.toLowerCase())) {
            merged.push(def);
          }
        }
        return merged;
      }),
      catchError(() => of(DEFAULT_ADMIN_CATEGORIES))
    );
  }

  getCategory(id: number): Observable<EventCategory> {
    return this.http.get<EventCategory>(`${this.baseUrl}/${id}`);
  }

  createCategory(request: CreateCategoryRequest): Observable<EventCategory> {
    return this.http.post<EventCategory>(this.baseUrl, request);
  }

  updateCategory(
    id: number,
    request: UpdateCategoryRequest
  ): Observable<EventCategory> {
    return this.http.put<EventCategory>(`${this.baseUrl}/${id}`, request);
  }

  deleteCategory(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
