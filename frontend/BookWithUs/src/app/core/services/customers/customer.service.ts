import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Customer } from '../../models/customers/customer.model';
import { UpdateCustomerRequest } from '../../models/customers/update-customer-request.model';

@Injectable({
  providedIn: 'root'
})
export class CustomerService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/customers';

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
}
