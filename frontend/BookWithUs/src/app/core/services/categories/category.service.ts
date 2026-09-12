import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { EventCategory } from '../../models/categories/event-category.model';
import { CreateCategoryRequest } from '../../models/categories/create-category-request.model';
import { UpdateCategoryRequest } from '../../models/categories/update-category-request.model';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/categories`;

  getCategories(): Observable<EventCategory[]> {
    return this.http.get<EventCategory[]>(this.baseUrl);
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
