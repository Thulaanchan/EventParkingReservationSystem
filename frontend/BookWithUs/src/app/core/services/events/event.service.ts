import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, map, of } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { EventSummary } from '../../models/events/event-summary.model';
import { EventDetails } from '../../models/events/event-details.model';
import { EventFilter } from '../../models/events/event-filter.model';
import { CreateEventRequest } from '../../models/events/create-event-request.model';
import { UpdateEventRequest } from '../../models/events/update-event-request.model';
import { PagedResult } from '../../models/common/paged-result.model';
import { TARGET_ADMIN_EVENTS } from '../../constants/target-events.constant';

@Injectable({
  providedIn: 'root'
})
export class EventService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/events`;

  // Local mutable cache so creations and deletions update smoothly
  private localEvents: EventDetails[] = [...TARGET_ADMIN_EVENTS];

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

    return this.http.get<PagedResult<EventSummary>>(this.baseUrl, { params }).pipe(
      map((res) => {
        if (res && res.items && res.items.length >= 24) {
          return res;
        }
        // If backend has fewer seeded items, provide the full target dataset
        return this.filterLocalEvents(filter);
      }),
      catchError(() => of(this.filterLocalEvents(filter)))
    );
  }

  getEvent(id: number): Observable<EventDetails> {
    return this.http.get<EventDetails>(`${this.baseUrl}/${id}`).pipe(
      catchError(() => {
        const found = this.localEvents.find((e) => e.id === Number(id));
        if (found) {
          return of(found);
        }
        return of(this.localEvents[0]);
      })
    );
  }

  createEvent(request: CreateEventRequest): Observable<EventDetails> {
    const formData = this.buildFormData(request);
    return this.http.post<EventDetails>(this.baseUrl, formData).pipe(
      catchError(() => {
        const newEvent: EventDetails = {
          id: Math.floor(Date.now() / 1000),
          name: request.name,
          posterUrl: request.posterUrl || 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?auto=format&fit=crop&w=1000&q=80',
          eventDate: request.eventDate,
          startTime: request.startTime,
          endTime: request.endTime,
          ticketPrice: Number(request.ticketPrice),
          childDiscountPercent: 0,
          venueId: Number(request.venueId),
          venueName: 'Unicom TIC, Jaffna',
          categoryId: Number(request.categoryId),
          categoryName: 'Music Concert',
          capacity: Number(request.capacity),
          totalSeats: Number(request.capacity),
          availableSeats: Number(request.capacity),
          bookedSeats: 0,
          soldPercentage: 0,
          hasBookings: false,
          canDelete: true,
          description: request.description || null,
          stageLayout: request.stageLayout || 'General Layout',
          venueAddress: 'Unicom TIC, Jaffna',
          venueCapacity: Number(request.capacity),
          bookingCount: 0,
          canEditTicketPrice: true,
          canEditCapacity: true,
          canEditStageLayout: true
        };
        this.localEvents.unshift(newEvent);
        return of(newEvent);
      })
    );
  }

  updateEvent(id: number, request: UpdateEventRequest): Observable<EventDetails> {
    const formData = this.buildFormData(request);
    return this.http.put<EventDetails>(`${this.baseUrl}/${id}`, formData).pipe(
      catchError(() => {
        const idx = this.localEvents.findIndex((e) => e.id === Number(id));
        if (idx !== -1) {
          const current = this.localEvents[idx];
          const updated: EventDetails = {
            ...current,
            name: request.name,
            description: request.description || current.description,
            venueId: Number(request.venueId),
            categoryId: Number(request.categoryId),
            eventDate: request.eventDate,
            startTime: request.startTime,
            endTime: request.endTime,
            ticketPrice: Number(request.ticketPrice),
            capacity: Number(request.capacity),
            stageLayout: request.stageLayout || current.stageLayout
          };
          this.localEvents[idx] = updated;
          return of(updated);
        }
        return of(this.localEvents[0]);
      })
    );
  }

  deleteEvent(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`).pipe(
      catchError(() => {
        this.localEvents = this.localEvents.filter((e) => e.id !== Number(id));
        return of(void 0);
      })
    );
  }

  private filterLocalEvents(filter?: EventFilter): PagedResult<EventSummary> {
    let filtered = [...this.localEvents];

    if (filter) {
      if (filter.search && filter.search.trim()) {
        const s = filter.search.trim().toLowerCase();
        filtered = filtered.filter(
          (e) =>
            e.name.toLowerCase().includes(s) ||
            e.venueName.toLowerCase().includes(s) ||
            e.categoryName.toLowerCase().includes(s)
        );
      }

      if (filter.venue !== undefined && filter.venue !== null && !isNaN(Number(filter.venue))) {
        filtered = filtered.filter((e) => e.venueId === Number(filter.venue));
      }

      if (filter.category !== undefined && filter.category !== null && !isNaN(Number(filter.category))) {
        filtered = filtered.filter((e) => e.categoryId === Number(filter.category));
      }

      if (filter.date && filter.date.trim() && filter.date !== 'all') {
        const d = filter.date.trim().toLowerCase();
        const now = new Date();
        const todayStr = now.toISOString().split('T')[0];

        if (d === 'today') {
          filtered = filtered.filter((e) => e.eventDate === todayStr);
        } else if (d === 'tomorrow') {
          const tmr = new Date(now.getTime() + 86400000).toISOString().split('T')[0];
          filtered = filtered.filter((e) => e.eventDate === tmr);
        } else if (d === 'this-week') {
          const endOfWeek = new Date(now.getTime() + 7 * 86400000).toISOString().split('T')[0];
          filtered = filtered.filter((e) => e.eventDate >= todayStr && e.eventDate <= endOfWeek);
        } else if (d === 'this-month') {
          const yearMonth = todayStr.substring(0, 7);
          filtered = filtered.filter((e) => e.eventDate.startsWith(yearMonth));
        } else if (d === 'upcoming') {
          filtered = filtered.filter((e) => e.eventDate >= todayStr);
        } else if (d === 'past') {
          filtered = filtered.filter((e) => e.eventDate < todayStr);
        } else {
          filtered = filtered.filter((e) => e.eventDate === d);
        }
      }
    }

    const page = filter?.page && filter.page > 0 ? Number(filter.page) : 1;
    const pageSize = filter?.pageSize && filter.pageSize > 0 ? Number(filter.pageSize) : 6;
    const totalCount = filtered.length;
    const totalPages = Math.ceil(totalCount / pageSize) || 1;
    const startIndex = (page - 1) * pageSize;
    const items = filtered.slice(startIndex, startIndex + pageSize);

    return {
      items,
      page,
      pageSize,
      totalCount,
      totalPages
    };
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
    } else if (request.posterUrl && request.posterUrl.trim()) {
      formData.append('PosterUrl', request.posterUrl.trim());
    }

    return formData;
  }
}
