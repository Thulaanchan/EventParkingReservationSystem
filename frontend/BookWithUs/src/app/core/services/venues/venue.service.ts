import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, map, of } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Venue } from '../../models/venues/venue.model';
import { CreateVenueRequest } from '../../models/venues/create-venue-request.model';
import { UpdateVenueRequest } from '../../models/venues/update-venue-request.model';
import { VenueAvailability } from '../../models/venues/venue-availability.model';
import { VenueAvailabilityQuery } from '../../models/venues/venue-availability-query.model';

export const DEFAULT_ADMIN_VENUES: Venue[] = [
  { id: 2, name: 'Unicom TIC, Jaffna', address: 'A9 Road, Jaffna', totalCapacity: 624, upcomingEventCount: 1 },
  { id: 5, name: 'Cinnamon Life, Colombo', address: '1 Justice Akbar Mawatha, Colombo 02', totalCapacity: 800, upcomingEventCount: 2 },
  { id: 7, name: 'Jaffna Cultural Centre', address: 'Hospital Road, Jaffna', totalCapacity: 360, upcomingEventCount: 1 },
  { id: 8, name: 'City Hall, Kandy', address: 'George E De Silva Mawatha, Kandy', totalCapacity: 450, upcomingEventCount: 1 },
  { id: 9, name: 'BMICH Main Hall, Colombo', address: 'Bauddhaloka Mawatha, Colombo 07', totalCapacity: 700, upcomingEventCount: 1 },
  { id: 3, name: 'Sugathadasa Indoor Stadium', address: 'Prince of Wales Ave, Colombo 14', totalCapacity: 5000, upcomingEventCount: 1 },
  { id: 4, name: 'Nelum Pokuna Mahinda Rajapaksa Theatre', address: '110 Ananda Coomaraswamy Mawatha, Colombo 07', totalCapacity: 1288, upcomingEventCount: 1 },
  { id: 1, name: 'EventFlow Main Hall', address: 'Colombo, Sri Lanka', totalCapacity: 1500, upcomingEventCount: 1 }
];

@Injectable({
  providedIn: 'root'
})
export class VenueService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/venues`;

  getVenues(): Observable<Venue[]> {
    return this.http.get<Venue[]>(this.baseUrl).pipe(
      map((items) => {
        if (!items || items.length === 0) {
          return DEFAULT_ADMIN_VENUES;
        }
        // Merge any missing defaults
        const existingIds = new Set(items.map((v) => v.id));
        const merged = [...items];
        for (const def of DEFAULT_ADMIN_VENUES) {
          if (!existingIds.has(def.id)) {
            merged.push(def);
          }
        }
        return merged;
      }),
      catchError(() => of(DEFAULT_ADMIN_VENUES))
    );
  }

  getVenue(id: number): Observable<Venue> {
    return this.http.get<Venue>(`${this.baseUrl}/${id}`);
  }

  createVenue(request: CreateVenueRequest): Observable<Venue> {
    return this.http.post<Venue>(this.baseUrl, request);
  }

  updateVenue(id: number, request: UpdateVenueRequest): Observable<Venue> {
    return this.http.put<Venue>(`${this.baseUrl}/${id}`, request);
  }

  deleteVenue(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  checkAvailability(
    id: number,
    query: VenueAvailabilityQuery
  ): Observable<VenueAvailability> {
    let params = new HttpParams()
      .set('date', query.date)
      .set('start', query.start)
      .set('end', query.end);

    if (query.excludeEventId !== undefined && query.excludeEventId !== null) {
      params = params.set('excludeEventId', query.excludeEventId.toString());
    }

    return this.http.get<VenueAvailability>(
      `${this.baseUrl}/${id}/availability`,
      { params }
    );
  }
}
