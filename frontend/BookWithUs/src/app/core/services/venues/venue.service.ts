import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Venue } from '../../models/venues/venue.model';
import { CreateVenueRequest } from '../../models/venues/create-venue-request.model';
import { UpdateVenueRequest } from '../../models/venues/update-venue-request.model';
import { VenueAvailability } from '../../models/venues/venue-availability.model';
import { VenueAvailabilityQuery } from '../../models/venues/venue-availability-query.model';

@Injectable({
  providedIn: 'root'
})
export class VenueService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/venues`;

  getVenues(): Observable<Venue[]> {
    return this.http.get<Venue[]>(this.baseUrl);
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
