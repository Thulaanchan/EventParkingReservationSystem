import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { PagedResult } from '../../models/common/paged-result.model';
import { Customer } from '../../models/customers/customer.model';
import { CustomerSummary } from '../../models/customers/customer-summary.model';
import { UpdateCustomerRequest } from '../../models/customers/update-customer-request.model';

@Injectable({
  providedIn: 'root'
})
export class CustomerService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/customers';

  /**
   * Searches/retrieves paginated customers for administrator.
   * Backend endpoint: GET /api/customers?search={search}&page={page}&pageSize={pageSize}
   */
  searchCustomers(
    search?: string,
    page: number = 1,
    pageSize: number = 10
  ): Observable<PagedResult<CustomerSummary>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());

    if (search && search.trim()) {
      params = params.set('search', search.trim());
    }

    return this.http.get<PagedResult<CustomerSummary>>(this.baseUrl, { params });
  }

  /**
   * Retrieves customer details by ID.
   * Backend endpoint: GET /api/customers/{id}
   */
  getCustomerById(id: number): Observable<Customer> {
    return this.http.get<Customer>(`${this.baseUrl}/${id}`);
  }

  /**
   * Updates customer profile by ID.
   * Backend endpoint: PUT /api/customers/{id}
   */
  updateCustomer(
    id: number,
    request: UpdateCustomerRequest
  ): Observable<Customer> {
    return this.http.put<Customer>(`${this.baseUrl}/${id}`, request);
  }

  /**
   * Deactivates customer account by ID (Admin only).
   * Backend endpoint: DELETE /api/customers/{id}
   */
  deactivateCustomer(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.baseUrl}/${id}`);
  }
}
