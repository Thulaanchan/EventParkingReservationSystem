import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { EventSummary } from '../../models/events/event-summary.model';
import { EventDetails } from '../../models/events/event-details.model';
import { EventFilter } from '../../models/events/event-filter.model';
import { CreateEventRequest } from '../../models/events/create-event-request.model';
import { UpdateEventRequest } from '../../models/events/update-event-request.model';
import { PagedResult } from '../../models/common/paged-result.model';

@Injectable({
  providedIn: 'root'
})
export class EventService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/events`;

  getEvents(filter?: EventFilter): Observable<PagedResult<EventSummary>> {
    let params = new HttpParams();

    if (filter) {
      if (filter.search && filter.search.trim()) {
        params = params.set('Search', filter.search.trim());
      }
      if (filter.venue !== undefined && filter.venue !== null) {
        params = params.set('Venue', filter.venue.toString());
      }
      if (filter.category !== undefined && filter.category !== null) {
        params = params.set('Category', filter.category.toString());
      }
      if (filter.date && filter.date.trim()) {
        params = params.set('Date', filter.date.trim());
      }
      if (filter.time && filter.time.trim()) {
        params = params.set('Time', filter.time.trim());
      }
      if (filter.page !== undefined && filter.page !== null) {
        params = params.set('Page', filter.page.toString());
      }
      if (filter.pageSize !== undefined && filter.pageSize !== null) {
        params = params.set('PageSize', filter.pageSize.toString());
      }
      if (filter.includePast !== undefined && filter.includePast !== null) {
        params = params.set('IncludePast', filter.includePast.toString());
      }
    }

    return this.http.get<PagedResult<EventSummary>>(this.baseUrl, { params });
  }

  getEvent(id: number): Observable<EventDetails> {
    return this.http.get<EventDetails>(`${this.baseUrl}/${id}`);
  }

  createEvent(request: CreateEventRequest): Observable<EventDetails> {
    const formData = this.buildFormData(request);
    return this.http.post<EventDetails>(this.baseUrl, formData);
  }

  updateEvent(id: number, request: UpdateEventRequest): Observable<EventDetails> {
    const formData = this.buildFormData(request);
    return this.http.put<EventDetails>(`${this.baseUrl}/${id}`, formData);
  }

  deleteEvent(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  private buildFormData(request: CreateEventRequest | UpdateEventRequest): FormData {
    const formData = new FormData();

    formData.append('Name', request.name);

    if (request.description && request.description.trim()) {
      formData.append('Description', request.description.trim());
    }

    formData.append('VenueId', request.venueId.toString());
    formData.append('CategoryId', request.categoryId.toString());
    formData.append('EventDate', request.eventDate);
    formData.append('StartTime', request.startTime);
    formData.append('EndTime', request.endTime);
    formData.append('TicketPrice', request.ticketPrice.toString());
    formData.append('Capacity', request.capacity.toString());

    if (request.stageLayout && request.stageLayout.trim()) {
      formData.append('StageLayout', request.stageLayout.trim());
    }

    if (request.poster instanceof File) {
      formData.append('Poster', request.poster, request.poster.name);
    }

    return formData;
  }
}
